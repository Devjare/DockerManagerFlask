class Config(object):
    DEBUG = True
    TESTING = False
    SECRET_KEY = "\xa8\xe8\xa4\xd0\x1f\xab-\xd5%\x0e\x0f/\xff\xddp\x08\x81 \xb60$\xe7NE"

    SQLALCHEMY_DATABASE_URI = 'sqlite:///db/manager.db'
    JSON_SORT_KEYS = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False
    SECRET_KEY = "\xa8\xe8\xa4\xd0\x1f\xab-\xd5%\x0e\x0f/\xff\xddp\x08\x81 \xb60$\xe7NE"

    SQLALCHEMY_DATABASE_URI = 'sqlite:///db/manager.db'
    JSON_SORT_KEYS = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_COOKIE_SECURE = False

class TestingConfig(Config):
    TESTING = True
