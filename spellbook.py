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

ILLUSTRATION_PROMPT = """Please provide the setting of the following scene in as few words as possible. Please be sure to include any characters, animals, or creatures mentioned in the scene. Keep in mind that the setting will need to include any important details for creating a proper illustration of the scene: """

SETTING_PROMPT = """Please provide the setting of the following scene in as few words as possible: """

STORYTELLER_PROMPT = """You are a game master telling a story from the user's perspective. There is only one user. End each scene with the following text: 'What do you want to do?' Here is the story so far: """

SUMMARIZE_PROMPT = """Please summarize the following scene: """

@app.route("/")
def main():
    return render_template('main.html')

@app.route("/scene", methods=['POST'])
def scene():
    previousScene = request.json.get('previousScene')
    if previousScene == "":
        print("using initial prompt as previous scene")
        previousScene = INITIAL_PROMPT
    print("previousScene: " + str(previousScene))
    userPrompt = request.json.get('userPrompt')
    print("userPrompt: " + str(userPrompt))
    messages=[
        {"role": "system", "content": STORYTELLER_PROMPT + previousScene},
    ]
    if userPrompt != "":
        messages.append({"role": "user", "content": userPrompt})
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    parsed_response = json.loads(str(response.choices[0].message))
    if userPrompt != "":
        return parsed_response['content']
    return previousScene + " " + parsed_response['content']

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
    scene = request.json.get('scene')
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": ILLUSTRATION_PROMPT},
            {"role": "user", "content": scene}
        ]
    )
    parsed_response = json.loads(str(response.choices[0].message))
    image_response = openai.Image.create(
        prompt=parsed_response['content'],
        n=1,
        size="1024x1024"
    )
    return image_response['data'][0]['url']

@app.route("/summarize", methods=['POST'])
def summarize():
    scene = request.json.get('scene')
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SUMMARIZE_PROMPT},
            {"role": "user", "content": scene}
        ]
    )
    parsed_response = json.loads(str(response.choices[0].message))
    return parsed_response['content']