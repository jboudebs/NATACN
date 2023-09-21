from flask import Flask, json, request
from flask_cors import CORS
import spacy
import locale
import json

def getpreferredencoding(do_setlocale=True):
    return "UTF-8"

locale.getpreferredencoding = getpreferredencoding

nlp = spacy.load("en_core_web_lg")

def spaCy_Similarity(data):
    word1 = data["word"]
    wordList = data["wordList"]
    print(word1, wordList)
    simList = []
    doc1 = nlp(word1)
    for word2 in wordList:
        doc2 = nlp(word2)
        similarity_score = doc1.similarity(doc2)
        simList.append({"word1": word1, "word2": word2, "similarity": similarity_score})
    return json.dumps(simList)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def get():
    word1 = request.args.get('word1')
    wordList = request.args.get('wordList')
    data = {"word": word1, "wordList": wordList}
    return spaCy_Similarity(data)

@app.route('/', methods=['POST'])
def post():
    data = json.loads(request.data.decode('utf-8'))
    return spaCy_Similarity(data)

if __name__ == '__main__':
    app.run(port=5001)
