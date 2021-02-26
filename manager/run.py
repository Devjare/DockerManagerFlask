from app import create_app
import sys

app = create_app("app.config.DevelopmentConfig")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("usage: %s port" % (sys.argv[0]))
        sys.exit(-1)

    p = int(sys.argv[1])
    print("start at port %s" % (p))
    app.run(host="0.0.0.0", port=p, debug=True, threaded=True)
