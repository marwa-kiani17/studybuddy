
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from bson.binary import Binary
from pymongo import MongoClient, errors
import base64
import re
import random  # Import random for selecting random MCQs

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  # Apply CORS globally
app.config['MONGO_URI'] = 'mongodb://localhost:27017/studybuddy'  # Update with your MongoDB URI

mongo = PyMongo(app)

def serialize_document(doc):
    doc['_id'] = str(doc['_id'])
    for key, value in doc.items():
        if isinstance(value, Binary):
            doc[key] = base64.b64encode(value).decode('utf-8')
    return doc

class UserManager:
    def __init__(self, db):
        self.users = db.users

    def signup(self, email, password, first_name, last_name):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return {'message': 'Invalid email format'}, 400

        existing_user = self.users.find_one({'email': email})
        if existing_user:
            return {'message': 'User already exists'}, 400

        try:
            hashed_password = generate_password_hash(password)
            self.users.insert_one({'email': email, 'password': hashed_password, 'first_name': first_name, 'last_name': last_name})
            return {'message': 'User created successfully'}, 201
        except errors.PyMongoError as e:
            return {'message': 'Database error', 'error': str(e)}, 500

    def signin(self, email, password):
        user = self.users.find_one({'email': email})

        if not user or not check_password_hash(user['password'], password):
            return {'message': 'Invalid credentials'}, 401

        return {'message': 'Login successful'}, 200

# Initialize the UserManager with the database
user_manager = UserManager(mongo.db)


@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data['email']
    password = data['password']
    first_name = data['first_name']
    last_name = data['last_name']
    response, status_code = user_manager.signup(email, password, first_name, last_name)
    return jsonify(response), status_code

@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data['email']
    password = data['password']
    response, status_code = user_manager.signin(email, password)
    return jsonify(response), status_code

class QuizManager:
    def __init__(self, db):
        self.mcq_data = db.mcq_data

    def get_quiz(self, subject_name, difficulty):
        mcqs = self.mcq_data.find({'subject_name': subject_name, 'difficulty': int(difficulty)})
        mcq_list = [serialize_document(mcq) for mcq in mcqs]

        if len(mcq_list) > 10:
            random.shuffle(mcq_list)
            mcq_list = mcq_list[:10]

        return {'message': 'Quiz generated successfully', 'quiz': mcq_list}, 200

quiz_manager = QuizManager(mongo.db)

    
@app.route('/get_quiz', methods=['POST'])
@cross_origin()
def get_quiz():
    try:
        subject_name = request.json['subject_name']
        difficulty = request.json['difficulty']
        app.logger.info(f'Received request for quiz: Subject={subject_name}, Difficulty={difficulty}')
        response, status_code = quiz_manager.get_quiz(subject_name, difficulty)
        return jsonify(response), status_code
    except Exception as e:
        app.logger.error(f'Error fetching quiz: {e}')
        return jsonify({'message': 'Internal server error'}), 500

class MarksManager:
    def __init__(self, db):
        self.quizdata = db.quizdata

    def store_marks(self, marks, user_id, subject, difficulty):
        quiz_id = str(ObjectId())

        existing_data = self.quizdata.find_one({'_id': ObjectId(user_id)})

        if existing_data:
            self.quizdata.update_one(
                {'_id': ObjectId(user_id)},
                {'$push': {'quizzes': {'quiz_id': quiz_id, 'marks': marks, 'subject': subject, 'difficulty': difficulty}}},
            )
        else:
            self.quizdata.insert_one(
                {'_id': ObjectId(user_id), 'quizzes': [{'quiz_id': quiz_id, 'marks': marks, 'subject': subject, 'difficulty': difficulty}]},
            )

        return {'message': 'Marks stored successfully', 'quiz_id': quiz_id}, 200
    

marks_manager = MarksManager(mongo.db)

@app.route('/store_marks', methods=['POST'])
@cross_origin()
def store_marks():
    try:
        data = request.json
        marks = data['marks']
        user_id = data['user_id']
        subject = data['subject']
        difficulty = data['difficulty']
        response, status_code = marks_manager.store_marks(marks, user_id, subject, difficulty)
        return jsonify(response), status_code
    except Exception as e:
        app.logger.error(f'Error storing marks: {e}')
        return jsonify({'message': 'Internal server error'}), 500

def get_latest_quiz(user_id, subject):
    try:
        user_data = mongo.db.quizdata.find_one({'_id': ObjectId(user_id)})
        if user_data:
            quizzes = [quiz for quiz in user_data.get('quizzes', []) if quiz['subject'] == subject]
            quizzes = sorted(quizzes, key=lambda x: x.get('date', ObjectId(x['quiz_id']).generation_time), reverse=True)
            if quizzes:
                return quizzes[0]
        return None
    except Exception as e:
        app.logger.error(f'Error fetching latest quiz: {e}')
        return None

def print_previous_marks(user_id, subject):
    try:
        latest_quiz = get_latest_quiz(user_id, subject)
        
        if not latest_quiz:
            suggestion = 1
            print(f"Suggestion: {suggestion}")
            return suggestion
        
        marks = latest_quiz['marks']
        difficulty = latest_quiz['difficulty']
        
        if marks >= 5 and (difficulty == 1 or difficulty == '1'):
    
            suggestion = 2
            
        elif marks >= 7 and (difficulty == 2 or difficulty == '2'):
            
            suggestion = 3
                
        elif marks < 6 and (difficulty == 2 or difficulty == '2'):
                    
            suggestion = 1
        elif marks < 7 and (difficulty == 1 or difficulty == '1'):
                
            suggestion = 1
        
        elif (marks >3 and marks < 7) and (difficulty == 3 or difficulty == '3'):
            suggestion = 2
        elif (marks <=3) and (difficulty == 3 or difficulty == '3'):
            suggestion = 1
        elif marks >= 7 and (difficulty == 3 or difficulty == '3'):
            
            suggestion = 3
        else:
            suggestion= 1
            

        print(f"Previous marks for {subject} (latest quiz):")
        print(f"Marks: {marks}")
        print(f"Difficulty: {difficulty}")
        print(f"Suggestion: {suggestion}")
        
        return suggestion

    except Exception as e:
        app.logger.error(f'Error fetching previous marks: {e}')
        return 'Internal server error'

@app.route('/get_subject_text', methods=['POST'])
@cross_origin()
def get_subject_text():
    try:
        subject = request.json['subject']
        user_id = '663c54b0065d2901f4dbb94e'
        suggestion = print_previous_marks(user_id, subject)
        print(suggestion)
        return jsonify({'suggestion': suggestion}), 200
    except Exception as e:
        app.logger.error(f'Error fetching subject text: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/get_user_subject_marks', methods=['GET'])
@cross_origin()
def get_user_subject_marks():
    try:
        quiz_data = mongo.db.quizdata.find()

        result = []
        for user_data in quiz_data:
            user_id = str(user_data['_id'])
            quizzes = user_data.get('quizzes', [])
            for quiz in quizzes:
                subject = quiz['subject']
                marks = quiz['marks']
                result.append({'user_id': user_id, 'subject': subject, 'marks': marks})

        for record in result:
            print(f"User ID: {record['user_id']}, Subject: {record['subject']}, Marks: {record['marks']}")

        return jsonify({'message': 'Data retrieved successfully', 'data': result}), 200
    except Exception as e:
        app.logger.error(f'Error fetching user subject marks: {e}')
        return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)

