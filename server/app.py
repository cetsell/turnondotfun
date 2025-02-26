from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
db = SQLAlchemy(app)
login_manager = LoginManager(app)

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    
class HUDElement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    config = db.Column(db.JSON)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/hud/elements', methods=['GET'])
def get_hud_elements():
    elements = HUDElement.query.all()
    return jsonify([{
        'id': e.id,
        'name': e.name,
        'type': e.type,
        'config': e.config
    } for e in elements])

@app.route('/api/hud/elements', methods=['POST'])
def create_hud_element():
    data = request.json
    element = HUDElement(
        name=data['name'],
        type=data['type'],
        config=data.get('config', {})
    )
    db.session.add(element)
    db.session.commit()
    return jsonify({
        'id': element.id,
        'name': element.name,
        'type': element.type,
        'config': element.config
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
