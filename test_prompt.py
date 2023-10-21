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

STORYTELLER_PROMPT = """You are a game master telling a story from the player's perspective. Please continue the adventure. Here is the story so far: """

# messages=[
#     {"role": "system", "content": STORYTELLER_PROMPT + INITIAL_PROMPT},
# 	{"role": "user", "content": "I want to walk around and take a look at the surroundings."},
# ]
# response = openai.ChatCompletion.create(
#     model="gpt-3.5-turbo",
#     messages=messages
# )

# parsed_response = json.loads(str(response.choices[0].message))

# print(parsed_response['content'])

if "" == None:
	print("yep")
else:
	print("nope")