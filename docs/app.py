from flask import Flask, request, jsonify, render_template
from requests.adapters import HTTPAdapter, Retry
import requests
from urllib.parse import quote
from dotenv import load_dotenv
import os
from game_config import GAME_MASTER_SYSTEM_PROMPT, GAME_STATES
import hashlib
import time
import re
import json
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()
app = Flask(__name__)
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
MISTRAL_API_URL = os.getenv('MISTRAL_API_URL')
class SessionManager:
    def __init__(self):
        self.session = self._create_session()
    def _create_session(self):
        session = requests.Session()
        retry_strategy = Retry(
            total=1,
            backoff_factor=0.1,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["POST", "GET"],
            respect_retry_after_header=False
        )
        adapter = HTTPAdapter(
            max_retries=retry_strategy,
            pool_connections=20,
            pool_maxsize=20,
            pool_block=False
        )
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        session.headers.update({
            'Authorization': f'Bearer {MISTRAL_API_KEY}',
            'Content-Type': 'application/json'
        })
        session.timeout = (1, 3)
        return session
    def close(self):
        self.session.close()
session_manager = SessionManager()
game_state = {
    'messages': [],
    'current_scene': None,
    'state': GAME_STATES['ASKING_NAME'],
    'user_prefs': {
        'name': None,
        'theme': None,
        'art_style': None
    },
    'image_cache': {},
    'inventory': []
}
def get_mistral_response(messages, max_tokens=500):
    try:
        logging.info(f"Sending request to Mistral API with messages: {messages}")
        response = session_manager.session.post(
            MISTRAL_API_URL,
            json={
                'model': 'mistral-tiny',
                'messages': messages,
                'max_tokens': max_tokens,
                'temperature': 0.7,
                'top_p': 0.95,
                'stream': False
            },
            timeout=(1, 3)
        )
        response.raise_for_status()
        ai_response = response.json()['choices'][0]['message']['content']
        logging.info(f"Received response from Mistral API: {ai_response}")
        return enforce_response_limits(ai_response)
    except Exception as e:
        logging.error(f"Error in get_mistral_response: {e}")
        return "An error occurred while communicating with the AI service."
def enforce_response_limits(text, max_chars=500, max_sentences=4):
    sentences = text.split('.')
    limited_sentences = sentences[:max_sentences]
    result = '. '.join(limited_sentences).strip()
    if len(result) > max_chars:
         result = result[:max_chars].rsplit(' ', 1)[0]
    return result + '.'
def generate_image(description):
    if not description:
        logging.warning("generate_image called with an empty description")
        return None
    try:
        clean_description = description.replace('\n', ' ').strip()
        encoded_prompt = quote(clean_description)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&nologo=true&quality=95"
        logging.info(f"Generated image URL: {image_url} with description: {description}")
        return image_url
    except Exception as e:
        logging.error(f"Error generating image URL with description {description}: {e}")
        return None
def handle_user_input(message):
    prefs = game_state['user_prefs']
    state_handlers = {
        GAME_STATES['ASKING_NAME']: lambda msg: handle_name(msg, prefs),
        GAME_STATES['ASKING_THEME']: lambda msg: handle_theme(msg, prefs),
        GAME_STATES['ASKING_STYLE']: lambda msg: handle_style(msg, prefs),
    }
    handler = state_handlers.get(game_state['state'])
    if handler:
        response = handler(message)
        logging.info(f"User input during setup: {message} response: {response}")
        return response
    logging.warning(f"User input not during gameplay: {message}")
    return None

def handle_name(message, prefs):
    prefs['name'] = message.strip()
    game_state['state'] = GAME_STATES['ASKING_THEME']
    return f"Hello {prefs['name']}! What kind of world would you like to explore? (Any theme you can imagine!)"

def handle_theme(message, prefs):
    prefs['theme'] = message.strip()
    game_state['state'] = GAME_STATES['ASKING_STYLE']
    return f"And finally, {prefs['name']}, what art style should your adventure be drawn in?"

def handle_style(message, prefs):
    prefs['art_style'] = message.strip()
    game_state['state'] = GAME_STATES['PLAYING']
    return f"Perfect! Your {prefs['theme']} adventure begins now, {prefs['name']}! What would you like to explore?"

@app.route('/')
def index():
    game_state['state'] = GAME_STATES['ASKING_NAME']
    game_state['user_prefs'] = {'name': None, 'theme': None, 'art_style': None}
    game_state['messages'] = []
    game_state['image_cache'] = {}
    game_state['inventory'] = []
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        logging.info(f"Received data in /chat: {data}")
        if not data:
             logging.warning("No JSON data received in /chat request")
             return jsonify({'error': 'No JSON data received'}), 400
        user_message = data.get('message')
        user_action = data.get('action')
        logging.info(f"User message: {user_message}, User action: {user_action}")
        if not user_message or not isinstance(user_message, str):
            logging.warning("Message is required in /chat request")
            return jsonify({'error': 'Message is required and must be a string'}), 400
        if game_state['state'] != GAME_STATES['PLAYING']:
            response = handle_user_input(user_message)
            if response:
                image_url = None
                if game_state['state'] == GAME_STATES['ASKING_THEME'] and game_state['user_prefs']['art_style']:
                    style_prompt = f", {game_state['user_prefs']['art_style']} style"
                    image_url = generate_image(response + style_prompt)
                return jsonify({'content': response, 'image_url': image_url, 'options': [], 'inventory': game_state['inventory']})

        game_state['messages'].append({"role": "user", "content": user_message})
        initial_context_messages = game_state['messages'][:5] if len(game_state['messages']) > 5 else game_state['messages']
        initial_context_str = ""
        for msg in initial_context_messages:
            initial_context_str += f" {msg['role']}: {msg['content']},"
        context_messages = game_state['messages'][-6:]
        context_str = ""
        for msg in context_messages:
            context_str += f" {msg['role']}: {msg['content']},"
        modified_system_prompt = GAME_MASTER_SYSTEM_PROMPT + f"""
            Use the first five messages for the initial context: {initial_context_str}.
            And the last 5 messages as the current context: {context_str}.
             Always base options on the current context.
            Begin your response with a descriptive sentence of the player location. Use the current user message as the players location.
            After your descriptive text response, ALWAYS include 3 potential next actions enclosed in square brackets, for instance:
            [Explore the crater, Follow the icy trail, Setup camp]. Do not include any extra text other than this list of actions.
            Format your response using only the following format:
            <descriptive sentence about location>. <ALWAYS provide 3 options enclosed in square brackets>

           You have access to the players inventory data, {game_state['inventory']}. You are ONLY to generate descriptive text based on the context and return three options. You are not to note when the player takes an action, or when the player acquires an item, return inventory lists, or any additional inventory information. Always provide only a descriptive message and three options.
        """
        logging.info(f"Modified System Prompt: {modified_system_prompt}")
        messages = [
            {"role": "system", "content": modified_system_prompt},
            {"role": "user", "content": f"action: {user_action} message: {game_state['messages'][-1]['content']}" if user_action else game_state['messages'][-1]['content']}
        ]

        ai_message = get_mistral_response(messages, max_tokens=600)
        logging.info(f"AI Response: {ai_message}")
        if not ai_message:
            logging.error("Could not retrieve a response from the AI")
            return jsonify({'error': 'Could not retrieve a response from the AI'}), 500

        image_url = None
        options = []
        ai_content = ai_message
        try:
            match = re.search(r'\[(.*?)\]', ai_message)
            if match:
               options_str = match.group(1)
               options = [option.strip() for option in options_str.split(',')]
               ai_content = ai_message.split("[")[0].strip()
        except Exception as e:
             logging.error(f"Error processing options: {e}")

        if game_state['state'] == GAME_STATES['PLAYING']:
             style_prompt = f", {game_state['user_prefs']['art_style']} style" if game_state['user_prefs']['art_style'] else ""
             cache_key = ai_content + style_prompt
             if cache_key in game_state['image_cache']:
               image_url = game_state['image_cache'][cache_key]
               logging.info(f"Image URL from cache: {image_url} with cache key: {cache_key}")
             else:
               image_url = generate_image(ai_content + style_prompt)
               if image_url:
                    game_state['image_cache'][cache_key] = image_url
                    logging.info(f"Image URL generated: {image_url} with cache key: {cache_key}")
               else:
                    logging.warning(f"Image URL generation failed with description {ai_content + style_prompt}")

        game_state['messages'].append({"role": "assistant", "content": ai_content})
        if user_action == 'acquire':
            if "berries" in user_message.lower() and "berries" not in [item['name'].lower() for item in game_state['inventory']]:
                 game_state['inventory'].append({'name': 'Berries', 'description': 'A handful of fresh, juicy forest berries.'})
                 ai_content += " You have acquired fresh forest berries."
            elif "ferns" in user_message.lower() and "ferns" not in [item['name'].lower() for item in game_state['inventory']]:
                 game_state['inventory'].append({'name': 'Ferns', 'description': 'A handful of fresh, vibrant ferns.'})
                 ai_content += " You have acquired fresh ferns."
            elif "mushrooms" in user_message.lower() and "mushrooms" not in [item['name'].lower() for item in game_state['inventory']]:
                  game_state['inventory'].append({'name': 'Mushrooms', 'description': 'A handful of fresh, edible mushrooms.'})
                  ai_content += " You have acquired edible mushrooms."
            else:
               ai_content += " There was nothing to acquire" if user_action == "acquire" else ""
        elif user_action == 'use':
              if "berries" in user_message.lower() or "berries" in [item['name'].lower() for item in game_state['inventory']]:
                  ai_content += " You used the berries."
                  game_state['inventory'] = [item for item in game_state['inventory'] if item['name'].lower() != 'berries']
              elif "ferns" in user_message.lower() or "ferns" in [item['name'].lower() for item in game_state['inventory']]:
                   ai_content += " You used the ferns."
                   game_state['inventory'] = [item for item in game_state['inventory'] if item['name'].lower() != 'ferns']
              elif "mushrooms" in user_message.lower() or "mushrooms" in [item['name'].lower() for item in game_state['inventory']]:
                    ai_content += " You used the mushrooms."
                    game_state['inventory'] = [item for item in game_state['inventory'] if item['name'].lower() != 'mushrooms']

        response_data =  {
            'content': ai_content,
            'image_url': image_url,
            'image_pending': False,
            'options': options,
            'inventory': game_state['inventory']
        }
        logging.info(f"Response data: {response_data}")
        logging.info(f"Current game state: {game_state['state']}")
        return jsonify(response_data)

    except Exception as e:
        logging.error(f"Error in chat endpoint: {e}")
        logging.error(f"Current game_state: {game_state}")
        logging.error(f"Messages: {game_state['messages']}")
        return jsonify({'error': str(e)}), 500

@app.route('/check_image', methods=['POST'])
def check_image():
    try:
         data = request.get_json()
         if not data:
            logging.warning("No JSON data received in /check_image request")
            return jsonify({'error': 'No data received'}), 400
         message = data.get('message')
         if not message or not isinstance(message, str):
            logging.warning("Message is required and must be a string in /check_image request")
            return jsonify({'error': 'Message is required and must be a string'}), 400

         assistant_messages = [msg['content'] for msg in game_state['messages'] if msg['role'] == 'assistant']
         if not assistant_messages:
            logging.warning("No AI message found in /check_image request")
            return jsonify({'error': 'No AI message found'}), 400
         last_ai_message = assistant_messages[-1]

         style_prompt = f", {game_state['user_prefs']['art_style']} style" if game_state['user_prefs']['art_style'] else ""
         cache_key = last_ai_message + style_prompt
         if cache_key in game_state['image_cache']:
            image_url = game_state['image_cache'][cache_key]
            logging.info(f"Image URL from cache: {image_url} with key: {cache_key} in check_image")
         else:
            image_url = generate_image(last_ai_message + style_prompt)
            if image_url:
                game_state['image_cache'][cache_key] = image_url
                logging.info(f"Image URL generated: {image_url} with key: {cache_key} in check_image")
            else:
               logging.warning(f"Image URL generation failed with description {last_ai_message + style_prompt} in check_image")

         return jsonify({'image_url': image_url})
    except Exception as e:
        logging.error(f"Error in check_image endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Interactive Story Explorer...")
    print("Opening your web browser...")
    import webbrowser
    webbrowser.open('http://localhost:5000')
    app.run(host='0.0.0.0', port=5000)