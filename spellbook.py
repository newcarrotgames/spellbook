from flask import Flask, render_template, request
import openai
import os
import json


app = Flask(__name__)
openai.organization = os.getenv("OPENAI_ORG")
openai.api_key = os.getenv("OPENAI_API_KEY")

INITIAL_PROMPT = """As the sun sets over the mystical land of Eldoria, you find yourself 
standing at the entrance of the ancient Forest of Whispers. Legends speak of a powerful 
artifact hidden deep within its depths, said to grant immense power to whoever possesses it. 
However, the forest is known to be cursed, with many adventurers never returning from its 
shadows. You take a deep breath and step forward, determined to find the artifact."""

SETTING_PROMPT = """Please provide the setting of the following scene in as few words as possible: """

STORYTELLER_PROMPT = """You are an interactive storyteller."""

@app.route("/")
def main():
    return render_template('main.html')

@app.route("/scene", methods=['POST'])
def scene():
    previousScene = request.json.get('previousScene')
    if previousScene == None:
        previousScene = INITIAL_PROMPT
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": STORYTELLER_PROMPT},
            {"role": "assistant", "content": previousScene},
        ]
    )
    parsed_response = json.loads(str(response.choices[0].message))
    if previousScene != None:
        return parsed_response['content']
    return previousScene + parsed_response['content']

@app.route("/setting", methods=['POST'])
def setting():
    scene = request.json.get('scene')
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SETTING_PROMPT},
            {"role": "user", "content": scene}
        ]
    )
    parsed_response = json.loads(str(response.choices[0].message))
    return parsed_response['content']

@app.route("/illustrate", methods=['POST'])
def illustrate():
    setting = request.json.get('setting')
    response = openai.Image.create(
        prompt=setting,
        n=1,
        size="1024x1024"
    )
    return response['data'][0]['url']