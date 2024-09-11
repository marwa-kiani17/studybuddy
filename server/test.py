from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import random

app = Flask(__name__)
CORS(app)  # Apply CORS globally
app.config['MONGO_URI'] = 'mongodb://localhost:27017/studybuddy'  # Update with your MongoDB URI

mongo = PyMongo(app)

@app.route("/quizz",methods=['GET'])
def quizz():
    mcqs = list(mongo.db.mcq_data.find({'subject_name': "Anatomy", 'difficulty': 2}).limit(10))
    print(mcqs)
    return jsonify(mcqs)
    
if __name__=="__main__":
    app.run(debug=True)