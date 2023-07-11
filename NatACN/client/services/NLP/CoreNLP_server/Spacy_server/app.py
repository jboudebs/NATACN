from flask import Flask, json, request
from flask_cors import CORS
import spacy
import locale
def getpreferredencoding(do_setlocale = True):
    return "UTF-8"
locale.getpreferredencoding = getpreferredencoding



question = "What is the birthdate of Barack Obama?"

nlp = spacy.load("en_core_web_trf")

def spaCy_NER(nl_question):
    print(nl_question)
    doc = nlp(nl_question)
    NER_list = []
    for ent in doc.ents:
        NER_list = NER_list + [{"word" : ent.text, "label" : ent.label_, "start_char" : ent.start_char, "end_char" : ent.end_char}]
    return json.dumps(NER_list)

##
## API
##


api = Flask(__name__)
CORS(api)

@api.route('/', methods=['GET'])
def get_companies():
    return spaCy_NER(question)

@api.route('/', methods=['POST'])
def post_companies():
    print(request.data.decode('utf-8'))
    return spaCy_NER(request.data.decode('utf-8'))

if __name__ == '__main__':
    api.run()

