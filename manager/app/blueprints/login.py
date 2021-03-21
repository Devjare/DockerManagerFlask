from flask import Blueprint, render_template, request, session
from app import dockercli, client, db
from app.constants import USERID, USERNAME, USERCONTAINERS
from app.db_models import User, Container, UsersContainers

login_bp = Blueprint("login", __name__, static_folder="url_for('static')", template_folder="url_for('templates')")

@login_bp.route('/', methods=['GET'])
def loginscreen():
    return render_template('login/login.html')

@login_bp.route('/logout', methods=['GET'])
def logout():
    print('session before logout: ', session)
    try:
        [session.pop(key) for key in list(session.keys())]
        print('session after logout: ', session)
    except Exception as e:
        return { 'error': e }

    return { 'success': True } 

@login_bp.route('/login', methods=['POST'])
def login():
    params = request.json;
    
    if(len(params) > 0):
        # authenticate
        username = params.get('username')
        password = params.get('password')

        res = authenticate(username, password)
        print('result: ', res)
        if(res == True): 
            session[USERNAME] = username

            try:
                conts = db.session.query(UsersContainers).filter(UsersContainers.user_id == session[USERID]).all()
                session[USERCONTAINERS] = []
                for x in conts:
                    # adds each container id to array of containers for that user.
                    session[USERCONTAINERS].append(x.container_id)
            except Exception as err:
                print('error: ', err)

            return { 'login': True }
        else:
            return { 'error': res } 

    return { 'error': 'An error occurred, failed to authenticate.' } 

def authenticate(username, password):
    print("------------------------------------ AUTHENTICATING ------------------------------")
    try:
        allusers = User.query.all()
    except Exception as ex:
        print('FAILED TO QUERY USERS: ', str(ex))
    print('all users: ', allusers)
    for user in allusers:
        if(user.username == username):
            if(user.password == password):
                session[USERID] = user.uid
                return True
            else:
                return 'Incorret password.'
    
    return "User doesn't exist"

@login_bp.route('/signup', methods=['POST'])
def signup():
    params = request.json;
    
    if(len(params) > 0):
        # authenticate
        username = params.get('username')
        password = params.get('password')

        exists = authenticate(username, password)
        if(exists):
            return { 'error': 'User already exists, login instead'}
        else:
            session[USERNAME] = username
            session[USERCONTAINERS] = []
            # insert to db user, and login
            user = User(username, password)
            
            db.session.add(user)
            db.session.commit()
    
            user = User.query.filter(User.username == username).first()
            print('user: ', user.uid);
            session[USERID] = user.uid

            return { 'signup': True } 
    
    return { 'error': 'An error occurred, failed to authenticate.' } 
