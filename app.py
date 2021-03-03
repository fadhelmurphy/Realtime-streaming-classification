import base64
from io import BytesIO
from PIL import Image
from flask import Flask, render_template, request,jsonify
import cv2
from tensorflow.compat.v1 import ConfigProto
from tensorflow.compat.v1 import InteractiveSession

config = ConfigProto()
config.gpu_options.allow_growth = True
session = InteractiveSession(config=config)
import tensorflow as tf
import tensorflow.keras as keras
from keras.preprocessing.image import img_to_array
import numpy as np
# with open('model/model.json', 'r') as f:
#       model = keras.models.model_from_json(f.read())
model = keras.models.load_model('model/model.h5')
label = [
"kue dadar gulung",
"kue kastengel",
"kue klepon",
"kue lapis",
"kue lumpur",
"kue putri salju",
"kue risoles",
"kue serabi",
]
app = Flask(__name__)

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')

@app.route('/api', methods=['POST'])
def api():
    if request.method == "POST":
        print("I am a post")
        if request.form:
            print("I have form data")
            #print(request.form['kommentar'])
        if request.data:
            data = request.get_json()
            image_data = data.get('content').split(",")[1]
            # with open(data.get('token')+'.jpg',"wb") as f:
            #     f.write(base64.b64decode(image_data))
            # image = cv2.imread(data.get('token')+'.jpg')
            # npimg = np.fromstring(data.get('content'), np.uint8)
            # image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
            im_bytes = base64.b64decode(image_data)
            im_arr = np.frombuffer(im_bytes, dtype=np.uint8)  # im_arr is one-dim Numpy array
            image = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)
            # cv2.imwrite('Test_gray.png', image)
            #PRE-PROCESSING
            image = cv2.resize(image, (150, 150))
            image = img_to_array(image)
            image = np.expand_dims(image, axis=0)
            image = image.astype("float") / 255.0
            #PREDICT
            proba = model.predict(image)[0]
            idx = np.argmax(proba)
            print(label[idx])
            print(proba[idx] * 100)
            # print("i have data",data.get('content'))
        # if request.json:
            # print("I have json",request.json['content'])
            # image_data = request.json['content'].split(",")[1]
            # with open("clientimage.png","wb") as f:
            #     f.write(base64.b64decode(image_data))
            # Do stuff with the data...
            return jsonify(success=1, label=label[idx], percent=(proba[idx] * 100))
        else:
            print("fail")

        return jsonify({})
    

if __name__ == '__main__':
    app.run(host= '0.0.0.0',debug=True,ssl_context='adhoc',port=5000)