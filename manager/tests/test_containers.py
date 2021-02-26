import sys,os
import tempfile

import pytest

sys.path.append(os.path.join(os.path.dirname(__file__),os.pardir,"manager"))

@pytest.fixture
def client():
    db_fd, app.config['DATABASE'] = tempfile.mkstemp()
    app.config['TESTING'] = True

    with app.test_client() as client:
        with app.app_context():
            init_db()
        yield client

    os.close(db_fd)
    os.unlink(app.config['DATABASE'])

def test_emtpy_db(client):
    rv = client.get('/')
    assert b'No entries here so far' in rv.data
