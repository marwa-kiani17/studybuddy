from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
import traceback
from transformers import pipeline
import fitz  # PyMuPDF for extracting text from PDFs
import spacy  # For quick revision using NLP
from keybert import KeyBERT
import re  # For whitespace normalization
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from bson.binary import Binary
from pymongo import MongoClient, errors
import base64
import random
import jwt  # Import JWT library
from datetime import timedelta
import datetime  # Add for timestamps
from apicode_backend import apicode



SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")

from langchain.chains import LLMChain
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import SystemMessage
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq
from dotenv import load_dotenv


load_dotenv()


# Initialize app and models
app = Flask(__name__)

# Allow cross-origin requests from the frontend, including preflight (OPTIONS) requests
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

app.config['MONGO_URI'] = 'mongodb://localhost:27017/studybuddy'  # MongoDB URI

mongo = PyMongo(app)
app.register_blueprint(apicode)



#marwas code

# Function to serialize MongoDB documents
def serialize_document(doc):
    doc['_id'] = str(doc['_id'])
    for key, value in doc.items():
        if isinstance(value, Binary):
            doc[key] = base64.b64encode(value).decode('utf-8')
    return doc

class FeedbackManager:
    def __init__(self, db):
        self.feedback = db.feedback

    def store_feedback(self, chat_id, bot_message, feedback_type):
        feedback_data = {
            "chat_id": chat_id,
            "bot_message": bot_message,
            "feedback_type": feedback_type,  # Either 'positive' or 'negative'
            "timestamp": datetime.utcnow()
        }
        app.logger.info(f"Storing feedback: {feedback_data}")  # Log the feedback being stored
        self.feedback.insert_one(feedback_data)

feedback_manager = FeedbackManager(mongo.db)

@app.route('/submit_feedback', methods=['POST'])
@cross_origin()
def submit_feedback():
    try:
        data = request.json
        chat_id = data['chat_id']
        bot_message = data['bot_message']
        feedback = data['feedback']

        app.logger.info(f"Received feedback: chat_id={chat_id}, bot_message={bot_message}, feedback={feedback}")

        # Store feedback for each message
        feedback_manager.store_feedback(chat_id, bot_message, feedback)

        return jsonify({"message": "Feedback recorded successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error recording feedback: {e}")
        return jsonify({'message': 'Internal server error'}), 500

##################################
# User Manager (Signup/Signin)
##################################

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

        # Generate JWT token valid for 1 hour
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(hours=1)  # Token expiration
        }, SECRET_KEY, algorithm="HS256")

        return {'message': 'Login successful', 'token': token}, 200  # Return token

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


##################################
# Quiz Manager
##################################

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

##################################
# Chat Manager
##################################

class ChatManager:
    def __init__(self, db):
        self.chats = db.chats

    def create_new_chat(self, user_id, chat_name):
        chat_id = str(ObjectId())
        chat_data = {
            "_id": chat_id,
            "user_id": user_id,
            "chat_name": chat_name,
            "messages": []
        }
        self.chats.insert_one(chat_data)
        return chat_id

    def add_message_to_chat(self, chat_id, sender, message):
        self.chats.update_one(
            {"_id": chat_id},
            {"$push": {"messages": {"sender": sender, "message": message, "feedback": None}}}
        )

    def get_chat_history(self, chat_id):
        chat = self.chats.find_one({"_id": chat_id})
        return chat.get("messages", []) if chat else []

    def get_user_chats(self, user_id):
        chats = self.chats.find({"user_id": user_id})
        return [{"chat_id": str(chat["_id"]), "chat_name": chat["chat_name"]} for chat in chats]

    
    def add_feedback_to_message(self, chat_id, bot_message, feedback_type, missing_info=None):
        try:
            # Debug: Log the chat_id and bot_message before attempting to update
            app.logger.info(f"Attempting to add feedback for chat_id={chat_id}, bot_message={bot_message}")

            # Update the specific message with feedback
            result = self.chats.update_one(
                {"_id": ObjectId(chat_id), "messages.message": bot_message},  # Match by chat_id and bot_message
                {"$set": {"messages.$.feedback": feedback_type, "messages.$.missing_info": missing_info}}
            )

            if result.matched_count == 0:
                app.logger.error(f"Message not found in chat {chat_id} for bot_message: {bot_message}")
            else:
                app.logger.info(f"Feedback successfully added to chat {chat_id} for bot_message: {bot_message}")

            return result
        except Exception as e:
            app.logger.error(f"Error updating feedback in MongoDB: {e}")
            raise

chat_manager = ChatManager(mongo.db)

@app.route('/create_chat', methods=['POST'])
@cross_origin()
def create_chat():
    try:
        user_id = request.json['user_id']
        chat_name = request.json['chat_name']
        chat_id = chat_manager.create_new_chat(user_id, chat_name)
        return jsonify({"chat_id": chat_id}), 201
    except Exception as e:
        app.logger.error(f'Error creating new chat: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/get_user_chats/<user_id>', methods=['GET'])
@cross_origin()
def get_user_chats(user_id):
    try:
        chats = chat_manager.get_user_chats(user_id)
        return jsonify({"chats": chats}), 200
    except Exception as e:
        app.logger.error(f'Error fetching user chats: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/get_chat/<chat_id>', methods=['GET'])
@cross_origin()
def get_chat(chat_id):
    try:
        messages = chat_manager.get_chat_history(chat_id)
        return jsonify({"messages": messages}), 200
    except Exception as e:
        app.logger.error(f'Error fetching chat: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/send_message', methods=['POST'])
@cross_origin()
def send_message():
    try:
        chat_id = request.json.get('chat_id')
        user_message = request.json.get('message')
        sender = request.json.get('sender')

        # Add the user message to the chat history in the database
        chat_manager.add_message_to_chat(chat_id, sender, user_message)

        # Generate chatbot response
        system_prompt = 'You are a friendly medical assistant chatbot.1:Answer briefly, giving only enough information to help. No detailed explanations at first.2:Use bullet points for lists and numbers for steps. And each bullet point should be on the next line.3:Always include a reference link (e.g., NCBI, PubMed) for medical answers.4:For non-medical questions, politely explain you only provide medical information and suggest searching Google.'
        prompt = ChatPromptTemplate.from_messages(
            [SystemMessage(content=system_prompt), MessagesPlaceholder(variable_name="chat_history"), HumanMessagePromptTemplate.from_template("{human_input}")])
        conversation = LLMChain(llm=groq_chat, prompt=prompt, memory=memory, verbose=False)
        bot_message = conversation.predict(human_input=user_message)

        # Add the bot response to the chat history
        chat_manager.add_message_to_chat(chat_id, "bot", bot_message)

        return jsonify({"user_message": user_message, "bot_message": bot_message}), 200
    except Exception as e:
        app.logger.error(f'Error sending message: {e}')
        return jsonify({'message': 'Internal server error'}), 500


##################################
# Chatbot Integration with Response Formatting (Existing)
##################################

# Initialize memory for conversation history
memory = ConversationBufferWindowMemory(k=9, memory_key="chat_history", return_messages=True)

# Load the GROQ API key from .env file
groq_api_key = os.getenv('GROQ_API_KEY')
model = 'llama3-8b-8192'

# Initialize the Groq model
groq_chat = ChatGroq(groq_api_key=groq_api_key, model_name=model)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')  # Get user input from the frontend
        system_prompt = 'You are a friendly medical assistant chatbot.1:Answer briefly, giving only enough information to help. No detailed explanations at first.2:Use bullet points for lists and numbers for steps. And each bullet point should be on the next line.3:Always include a reference link (e.g., NCBI, PubMed etc) for medical answers.4:For non-medical questions, politely explain you only provide medical information and suggest searching Google.please dont add this: Please note that I am a medical assistant chatbot, and I can only provide general information. If you have specific questions or concerns, its always best to consult with a healthcare professional. You are a medical chatbot you can answer questions related to medicine.'

        prompt = ChatPromptTemplate.from_messages(
            [SystemMessage(content=system_prompt), MessagesPlaceholder(variable_name="chat_history"), HumanMessagePromptTemplate.from_template("{human_input}")])
        conversation = LLMChain(llm=groq_chat, prompt=prompt, memory=memory, verbose=False)
        response = conversation.predict(human_input=user_message)

        formatted_response = format_response(response)
        return jsonify({"response": formatted_response})
    
    except Exception as e:
        app.logger.error(f'Error in chatbot: {e}')
        return jsonify({'message': 'Internal server error'}), 500

# Function to format response
def format_response(response):
    """
    Format the response dynamically.
    - Example: convert bullet points or paragraphs for better display on the front end.
    """
    bullet_point_patterns = [r"^\* (.*)", r"^• (.*)"]  # Recognize both '*' and '•' as bullet points
    numbered_list_pattern = r"^\d+\. (.*)"  # Recognize numbered lists

    # Replace bullet point patterns and numbered lists with appropriate HTML tags
    response_lines = response.split("\n")
    formatted_lines = []
    in_bullet_list = False
    in_numbered_list = False

    for line in response_lines:
        # Check for bullet points
        if any(re.match(pattern, line) for pattern in bullet_point_patterns):
            if not in_bullet_list:
                formatted_lines.append("<ul>")
                in_bullet_list = True
            formatted_lines.append(f"<li>{line[2:].strip()}</li>")  # remove '* ' or '• ' and wrap with <li>
        
        # Check for numbered lists
        elif re.match(numbered_list_pattern, line):
            if not in_numbered_list:
                formatted_lines.append("<ol>")
                in_numbered_list = True
            formatted_lines.append(f"<li>{line[3:].strip()}</li>")  # remove '1. ', '2. ', etc., and wrap with <li>
        
        # Handle regular paragraphs
        else:
            if in_bullet_list:
                formatted_lines.append("</ul>")
                in_bullet_list = False
            if in_numbered_list:
                formatted_lines.append("</ol>")
                in_numbered_list = False
            formatted_lines.append(f"<p>{line.strip()}</p>")  # wrap regular lines in <p>

    # Close any open lists at the end of the response
    if in_bullet_list:
        formatted_lines.append("</ul>")
    if in_numbered_list:
        formatted_lines.append("</ol>")

    return "\n".join(formatted_lines)

    


# Load the summarizer and keyword extraction models
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
kw_model = KeyBERT()

# Load spaCy model for sentence extraction
nlp = spacy.load('en_core_web_sm')

# Function to extract text from the PDF
def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text += page.get_text("text")
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise e

# Use spaCy for sentence segmentation to avoid issues with word concatenation
def segment_sentences(text):
    doc = nlp(text)
    return [sent.text for sent in doc.sents]

# Function to chunk and summarize text
def summarize_text_long(transcript_text, max_chunk_length=500):
    sentences = segment_sentences(transcript_text)
    current_chunk = []
    current_length = 0
    chunks = []

    for sentence in sentences:
        sentence_length = len(sentence.split())
        if current_length + sentence_length <= max_chunk_length:
            current_chunk.append(sentence)
            current_length += sentence_length
        else:
            chunks.append(' '.join(current_chunk).strip())  # Join sentences in the chunk and strip leading/trailing spaces
            current_chunk = [sentence]
            current_length = sentence_length

    if current_chunk:
        chunks.append(' '.join(current_chunk).strip())  # Add the final chunk

    # Summarize each chunk and clean up spaces
    summaries = []
    for i, chunk in enumerate(chunks):
        if chunk.strip():  # Avoid empty chunks
            print(f"\n--- Chunk {i + 1} ---")
            print(chunk)  # Print the chunk being summarized
            summary = summarize_chunk(chunk)
            print(f"--- Summary of Chunk {i + 1} ---")
            print(summary)  # Print the summary of the chunk
            summaries.append(summary)
    
    # Ensure proper spacing between summarized chunks
    cleaned_summaries = ' '.join(summaries).replace('  ', ' ')  # Remove multiple spaces
    cleaned_summaries = re.sub(r'\s+', ' ', cleaned_summaries).strip()  # Normalize whitespaces

    return cleaned_summaries

# Function to summarize each chunk
def summarize_chunk(chunk, custom_length=None):
    chunk_length = len(chunk.split())
    if chunk_length < 5:
        return ""  # Ignore chunks that are too short

    max_length = min(150, int(chunk_length * 0.85))  # Default max length
    min_length = max(50, int(chunk_length * 0.30))    # Default min length

    summary = summarizer(chunk, max_length=max_length, min_length=min_length, num_beams=2, do_sample=False)[0]['summary_text']
    return summary

# Function to extract key sentences for quick revision
def extract_key_sentences(summary):
    try:
        doc = nlp(summary)
        sentences = [sent.text for sent in doc.sents]

        # Dynamically calculate the number of sentences based on summary length
        summary_length = len(summary.split())
        
        # Dynamic scaling: at least 3, up to 15 key sentences, based on summary length
        num_sentences = max(3, min(15, summary_length // 50))  # Adjust ratio as needed

        key_sentences = []
        
        # Use the KeyBERT model to extract keywords directly
        keywords = kw_model.extract_keywords(summary)
        keywords = [keyword[0] for keyword in keywords]
        
        # Log extracted keywords for debugging
        print(f"Extracted keywords: {keywords}")

        # Select sentences containing at least one keyword
        for sent in sentences:
            if any(keyword in sent for keyword in keywords):
                key_sentences.append(sent)
            if len(key_sentences) >= num_sentences:
                break

        # Fallback to the first N sentences if not enough key sentences are found
        if len(key_sentences) < num_sentences:
            key_sentences = sentences[:num_sentences]

        return key_sentences
    except Exception as e:
        print(f"Error in extract_key_sentences: {str(e)}")
        raise e  # Rethrow the exception to be caught in the route handler


# Route to handle Summarization (File Upload)
@app.route('/summarize_pdf', methods=['POST'])
@cross_origin(origins='http://localhost:3000')
def summarize_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"message": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"message": "No selected file"}), 400

        if file:
            # Save the uploaded file
            file_path = os.path.join('./uploads', file.filename)
            file.save(file_path)

            # Extract text from the PDF and summarize it
            extracted_text = extract_text_from_pdf(file_path)
            summary = summarize_text_long(extracted_text)

            # Remove the saved file after summarization
            os.remove(file_path)
            return jsonify({"summary": summary}), 200

    except Exception as e:
        print(f"Error during PDF summarization: {e}")
        print(traceback.format_exc())
        return jsonify({"message": "Internal server error"}), 500

# Route to handle Quick Revision (extract key sentences)
@app.route('/quick_revision', methods=['POST', 'OPTIONS'])
@cross_origin(origins='http://localhost:3000')
def quick_revision():
    try:
        data = request.json
        summary = data.get('summary', '')

        if not summary:
            return jsonify({"error": "No summary provided"}), 400

        # Log the summary received for debugging
        print(f"Summary received: {summary}")

        # Extract key sentences from the summary
        key_sentences = extract_key_sentences(summary)

        # Return key sentences as a list
        return jsonify({"bullet_points": key_sentences}), 200

    except Exception as e:
        print("Error during quick revision:")
        print(traceback.format_exc())  # This will give a detailed error message
        return jsonify({"message": "Internal server error"}), 500

# Route to extract keywords
@app.route('/extract_keywords', methods=['POST', 'OPTIONS'])
@cross_origin(origins='http://localhost:3000')
def extract_keywords_route():
    try:
        data = request.json
        summary = data.get('summary', '')

        if not summary:
            return jsonify({"error": "No summary provided"}), 400

        # Log received summary
        print(f"Summary for keyword extraction: {summary}")

        # Dynamically set the number of keywords based on the summary length
        summary_length = len(summary.split())
        num_keywords = min(10, max(3, summary_length // 50))  # Dynamically choose 3 to 10 keywords

        # Perform keyword extraction
        keywords_with_scores = kw_model.extract_keywords(summary, keyphrase_ngram_range=(1, 3), stop_words='english', 
                                                     top_n=num_keywords, use_maxsum=True, nr_candidates=20, diversity=0.7)

        keywords = [kw[0] for kw in keywords_with_scores]
        total_relevance_score = sum([kw[1] for kw in keywords_with_scores])

        # Log extracted keywords and scores
        print(f"Extracted Keywords: {keywords}, Total Relevance Score: {total_relevance_score}")

        return jsonify({"keywords": keywords, "total_relevance_score": total_relevance_score}), 200

    except Exception as e:
        print("Error during keyword extraction:")
        print(traceback.format_exc())
        return jsonify({"message": "Internal server error"}), 500




from datetime import datetime, timedelta, timezone



##################################
# Dashboard Feedback Manager
##################################

class DashboardFeedbackManager:
    def __init__(self, db):
        self.dashboard_feedback = db.dashboard_feedback

    def store_dashboard_feedback(self, user_id, feedback):
        feedback_data = {
            "user_id": user_id,
            "feedback": feedback
            # Timestamp removed as per requirement
        }
        app.logger.info(f"Storing dashboard feedback: {feedback_data}")  # Log the feedback being stored
        self.dashboard_feedback.insert_one(feedback_data)

dashboard_feedback_manager = DashboardFeedbackManager(mongo.db)

##################################
# Dashboard Feedback Route
##################################

@app.route('/submit_dashboard_feedback', methods=['POST', 'OPTIONS'])
@cross_origin(origin='http://localhost:3000', methods=['POST', 'OPTIONS'])
def submit_dashboard_feedback():
    try:
        if request.method == 'OPTIONS':
            # CORS preflight request
            return jsonify({'message': 'CORS preflight successful'}), 200

        data = request.json
        user_id = data.get('user_id')  # Use hardcoded ID if not provided
        feedback = data.get('feedback')

        if not feedback:
            return jsonify({'message': 'Feedback is required'}), 400

        app.logger.info(f"Received dashboard feedback: user_id={user_id}, feedback={feedback}")

        # Store the dashboard feedback
        dashboard_feedback_manager.store_dashboard_feedback(user_id, feedback)

        return jsonify({"message": "Dashboard feedback recorded successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error recording dashboard feedback: {e}")
        return jsonify({'message': 'Internal server error'}), 500




class MarksManager:
    def __init__(self, db):
        self.quizdata = db.quizdata

    def store_marks(self, marks, user_id, subject, difficulty):
        quiz_id = str(ObjectId())  # Generate a unique ID for the quiz
        timestamp = datetime.now(timezone.utc)  # Generate the current UTC timestamp

        # Check if the user already exists in the database
        existing_data = self.quizdata.find_one({'_id': ObjectId(user_id)})

        if existing_data:
            # If the user exists, add the new quiz data to the existing quizzes array
            self.quizdata.update_one(
                {'_id': ObjectId(user_id)},
                {'$push': {'quizzes': {
                    'quiz_id': quiz_id,
                    'marks': marks,
                    'subject': subject,
                    'difficulty': difficulty,
                    'timestamp': timestamp  # Add the timestamp
                }}}
            )
        else:
            # If the user does not exist, create a new document with the quiz data
            self.quizdata.insert_one({
                '_id': ObjectId(user_id),
                'quizzes': [{
                    'quiz_id': quiz_id,
                    'marks': marks,
                    'subject': subject,
                    'difficulty': difficulty,
                    'timestamp': timestamp  # Add the timestamp
                }]
            })

        return {'message': 'Marks stored successfully', 'quiz_id': quiz_id}, 200


# Instantiate the MarksManager with the MongoDB database
marks_manager = MarksManager(mongo.db)


@app.route('/store_marks', methods=['POST'])
@cross_origin()
def store_marks():
    try:
        # Extract data from the incoming JSON request
        data = request.json
        marks = data['marks']
        user_id = data['user_id']
        subject = data['subject']
        difficulty = data['difficulty']

        # Store the marks and associated data
        response, status_code = marks_manager.store_marks(
            marks, user_id, subject, difficulty
        )
        return jsonify(response), status_code
    except Exception as e:
        # Log and return an error response in case of an exception
        app.logger.error(f'Error storing marks: {e}')
        return jsonify({'message': 'Internal server error'}), 500


# New route to fetch user performance data
@app.route('/get_user_performance/<user_id>', methods=['GET'])
@cross_origin()
def get_user_performance(user_id):
    try:
        user_data = mongo.db.quizdata.find_one({'_id': ObjectId(user_id)})
        if not user_data:
            return jsonify({'message': 'User not found'}), 404

        quizzes = user_data.get('quizzes', [])

        performance_data = []
        for quiz in quizzes:
            performance_data.append({
                'quiz_id': quiz['quiz_id'],
                'marks': quiz['marks'],
                'subject': quiz['subject'],
                'difficulty': quiz['difficulty'],
                'timestamp': quiz.get('timestamp', ObjectId(quiz['quiz_id']).generation_time)
            })

        return jsonify({'message': 'Performance data retrieved successfully', 'data': performance_data}), 200
    except Exception as e:
        app.logger.error(f'Error fetching user performance data: {e}')
        return jsonify({'message': 'Internal server error'}), 500

def get_latest_quiz(user_id, subject):
    try:
        user_data = mongo.db.quizdata.find_one({'_id': ObjectId(user_id)})
        if user_data:
            quizzes = [quiz for quiz in user_data.get('quizzes', []) if quiz['subject'] == subject]
            quizzes = sorted(quizzes, key=lambda x: x.get('timestamp', ObjectId(x['quiz_id']).generation_time), reverse=True)
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
        elif marks <= 6 and (difficulty == 2 or difficulty == '2'):
            suggestion = 1
        elif marks < 7 and (difficulty == 1 or difficulty == '1'):
            suggestion = 1
        elif (marks > 3 and marks < 7) and (difficulty == 3 or difficulty == '3'):
            suggestion = 2
        elif (marks <= 3) and (difficulty == 3 or difficulty == '3'):
            suggestion = 1
        elif marks >= 7 and (difficulty == 3 or difficulty == '3'):
            suggestion = 3
        else:
            suggestion = 1

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
        user_id = request.json.get('user_id')
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
        user_id = request.args.get('user_id')
        subject = request.args.get('subject')
        difficulty = request.args.get('difficulty')

        if not user_id:
            return jsonify({'message': 'User ID is required'}), 400

        # Fetch user data
        user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)}, {'first_name': 1, 'last_name': 1})
        if not user_data:
            return jsonify({'message': 'User not found'}), 404

        user_name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()

        # Fetch quiz data
        query = {'_id': ObjectId(user_id)}
        quiz_data_cursor = mongo.db.quizdata.find(query)

        result = []
        for user_data in quiz_data_cursor:
            quizzes = user_data.get('quizzes', [])
            for quiz in quizzes:
                if (not subject or quiz['subject'] == subject) and (not difficulty or str(quiz['difficulty']) == str(difficulty)):
                    quiz_entry = {
                        'user_id': str(user_data['_id']),
                        'user_name': user_name,
                        'subject': quiz['subject'],
                        'difficulty': quiz['difficulty'],
                        'marks': quiz['marks'],
                        'timestamp': quiz.get('timestamp', ObjectId(quiz['quiz_id']).generation_time)
                    }
                    result.append(quiz_entry)

        return jsonify({'message': 'Data retrieved successfully', 'data': result}), 200
    except Exception as e:
        app.logger.error(f'Error fetching user subject marks: {e}')
        return jsonify({'message': 'Internal server error'}), 500



@app.route('/get_recommendations', methods=['POST', 'OPTIONS'])
@cross_origin()
def get_recommendations():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return jsonify({'message': 'CORS preflight request successful'}), 200

    try:
        # Extract user ID and subjects from the request
        data = request.json
        user_id = data.get('user_id')
        subjects = data.get('subjects', [])  # Array of subjects
        
        if not user_id:
            return jsonify({'message': 'User ID is required'}), 400

        # Fetch user performance data
        query = {'_id': ObjectId(user_id)}
        user_data = mongo.db.quizdata.find_one(query)

        if not user_data:
            return jsonify({'message': 'No performance data found for user'}), 404

        quizzes = user_data.get('quizzes', [])
        
        # Filter quizzes by selected subjects
        if subjects:
            quizzes = [quiz for quiz in quizzes if quiz['subject'] in subjects]

        if not quizzes:
            return jsonify({'message': f'No quizzes found for subjects: {subjects}'}), 404

        # Analyze performance for recommendations
        performance_summary = {
            "subjects": subjects if subjects else ["All Subjects"],
            "low_scores": [quiz for quiz in quizzes if quiz['marks'] <= 5],
            "average_scores": [quiz for quiz in quizzes if 5 < quiz['marks'] <= 7],
            "high_scores": [quiz for quiz in quizzes if quiz['marks'] > 7],
        }

        # Prepare prompt for Groq API
        system_prompt = f"""
        You are an educational assistant specializing in personalized recommendations.
        Based on the student's performance below, provide concise study recommendations to improve their performance in {performance_summary['subjects']}.
        Your response should:
        1. Include only bullet points referencing reliable online resources tailored to the student's performance in the specified subjects.
        2. Provide a brief description of what the resource offers and how it will help the student.
        3. Each bullet point must include a hyperlink to the resource (e.g., NCBI, PubMed, or standard educational platforms) and it is very important for me to keep the bullet points short and natural. Only 5 bullet points and not more then that and provide links for each too okay?
        Data: {performance_summary}
        """


        
        # Generate response using Groq API
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(content=system_prompt),
                MessagesPlaceholder(variable_name="chat_history"),
                HumanMessagePromptTemplate.from_template("{human_input}")
            ]
        )
        conversation = LLMChain(llm=groq_chat, prompt=prompt, memory=memory, verbose=False)
        response = conversation.predict(human_input="Generate personalized study recommendations.")

        return jsonify({"recommendations": response}), 200

    except Exception as e:
        app.logger.error(f"Error generating recommendations: {e}")
        return jsonify({'message': 'Internal server error'}), 500





        
@app.route('/get_quiz_frequency/<user_id>', methods=['GET'])
@cross_origin()
def get_quiz_frequency(user_id):
    try:
        from datetime import datetime

        user_data = mongo.db.quizdata.find_one({'_id': ObjectId(user_id)})
        if not user_data:
            return jsonify({'message': 'User not found'}), 404

        quizzes = user_data.get('quizzes', [])
        frequency_by_date = {}

        for quiz in quizzes:
            date = quiz.get('timestamp', ObjectId(quiz['quiz_id']).generation_time).date()
            if date not in frequency_by_date:
                frequency_by_date[date] = 0
            frequency_by_date[date] += 1

        sorted_dates = sorted(frequency_by_date.items())
        return jsonify({"frequency": sorted_dates}), 200
    except Exception as e:
        app.logger.error(f"Error in get_quiz_frequency: {e}")
        return jsonify({'message': 'Internal server error', 'error': str(e)}), 500
    

@app.route('/get_user_badges', methods=['GET'])
@cross_origin()
def get_user_badges():
    try:
        user_id = request.args.get('user_id')

        if not user_id:
            return jsonify({'message': 'User ID is required'}), 400

        # Fetch user quiz data
        user_data = mongo.db.quizdata.find_one({'_id': ObjectId(user_id)})
        if not user_data:
            return jsonify({'message': 'No quiz data found for this user'}), 404

        quizzes = user_data.get('quizzes', [])

        # Group quizzes by subject
        subject_quizzes = {}
        for quiz in quizzes:
            subject = quiz['subject']
            if subject not in subject_quizzes:
                subject_quizzes[subject] = []
            subject_quizzes[subject].append(quiz)

        badges = []

        for subject, subject_quiz_list in subject_quizzes.items():
            # Sort quizzes by timestamp (latest first)
            subject_quiz_list.sort(key=lambda q: q['timestamp'], reverse=True)

            # Consider only the latest 3 quizzes
            latest_three_quizzes = subject_quiz_list[:3]

            if len(latest_three_quizzes) < 3:
                continue  # Skip subjects with less than 3 quizzes

            # Calculate average marks for the latest three quizzes
            average_marks = sum(quiz['marks'] for quiz in latest_three_quizzes) / 3

            # Determine badge type based on marks
            if average_marks >= 8:
                badges.append({'subject': subject, 'badge_type': 'golden'})
            elif 6 <= average_marks < 8:
                badges.append({'subject': subject, 'badge_type': 'silver'})
            elif 4 <= average_marks < 6:
                badges.append({'subject': subject, 'badge_type': 'bronze'})

        return jsonify({'badges': badges}), 200

    except Exception as e:
        app.logger.error(f"Error fetching badges: {e}")
        return jsonify({'message': 'Internal server error'}), 500




if __name__ == '__main__':
    print("Starting Flask server...")
app.run(port=5000, debug=False)