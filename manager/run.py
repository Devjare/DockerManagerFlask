from app import create_app
import os

# get the app, pass as arg the rout to the config that
# is gonna be used.
app = create_app("app.config.Config")

# run the app
if __name__ == '__main__':
    # default port, in case not specified.
    p = "46000"
    if("PORT" in os.environ):
        p = os.environ["PORT"]

    app.run(host="0.0.0.0", port=p, debug=True, threaded=True)
