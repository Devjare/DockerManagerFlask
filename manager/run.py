from app import create_app
import os

app = create_app("app.config.DevelopmentConfig")

if __name__ == '__main__':
    print(os.environ['PORT'])
    # default port
    p = "46000"
    if("PORT" in os.environ):
        p = os.environ["PORT"]

    app.run(host="0.0.0.0", port=p, debug=True, threaded=True)
