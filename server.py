from aiohttp import web
import socketio
import aiohttp_cors
import time
import redis
import pickle
import os
import random
from pywebpush import webpush, WebPushException

DER_BASE64_ENCODED_PRIVATE_KEY_FILE_PATH = os.path.join(os.getcwd(),"private_key.txt")
DER_BASE64_ENCODED_PUBLIC_KEY_FILE_PATH = os.path.join(os.getcwd(),"public_key.txt")
VAPID_PRIVATE_KEY = open(DER_BASE64_ENCODED_PRIVATE_KEY_FILE_PATH, "r+").readline().strip("\n")
VAPID_PUBLIC_KEY = open(DER_BASE64_ENCODED_PUBLIC_KEY_FILE_PATH, "r+").read().strip("\n")
VAPID_CLAIMS = {
"sub": "mailto:rampalli.srivatsa@quantiphi.com"
}

def send_web_push(subscription_information, message_body):
    # print(subscription_information["subscription_token"])
    return webpush(
        subscription_info=subscription_information["subscription_token"],
        data=message_body,
        vapid_private_key=VAPID_PRIVATE_KEY,
        vapid_claims=VAPID_CLAIMS
    )



r = redis.Redis(
    host='127.0.0.1',
    port=6379,
    db=2
    )
redis_client = redis.Redis(
    host='127.0.0.1',
    port=6379,
    db=0
    )

# creates a new Async Socket IO Server
sio = socketio.AsyncServer(cors_allowed_origins='*')
# Creates a new Aiohttp Web Application
app = web.Application()
# Binds our Socket.IO server to our Web App
cors = aiohttp_cors.setup(app)

# instance
sio.attach(app)

async def pickl(data):
    sub = pickle.dumps(data)
    return sub

async def unpickl(data):
    sub = pickle.loads(data)
    return sub

async def index(request):
    with open('./static/index/index.html') as f:        
        return web.Response(text=f.read(), content_type='text/html')

async def process(request):
    with open('./static/process/process.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

async def saveToDatabase(uid, subscription):
    sub_p= await pickl(subscription)
    redis_client.set(uid,sub_p)
    print(redis_client.get(uid))

async def save(request):
    data = await request.json()
    # print(data)
    subs = data["subscription_token"]
    uid = data["user"]
    await saveToDatabase(uid,subs)
    # print(subs)
    return web.Response(text="Sent?")

async def sw_notify(request):
    data = await request.json()
    message = data["message"]
    uid = data["user"]
    for key in redis_client.scan_iter("*"):
        if(int(key)!=int(uid)):
            
            subscription=redis_client.get(key)
            sub_p=await unpickl(subscription)
            # print(sub_p)
            # print(sub_p)
            try:
                webpush(
                    subscription_info=sub_p,
                    data=message,
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims=VAPID_CLAIMS
                )
            except Exception as e:
                # print(e)
                # print(e)
                pass
    return web.Response(text="Ssup")

# Web Sockets Part
@sio.on('connect')
async def connected(sid,env):
    print("open", sid)


@sio.on('message')
async def print_message(sid, message):

    print("Socket ID: " , sid)
    
    sids.append(sid)
    print(message)
@sio.on('user')
async def reg_user(sid,userid):
    # print(type(sid))
    # sids.append(sid)

    r.set(int(userid),pickle.dumps(sid))
@sio.on('disconnect')
async def closed(sid):
    print("closed", sid)

async def ws_notify(request):
    data = await request.json()
    
    message="Process Started"
    # side = r.get(data["user"])
    userid=data["user"]
    stop = data["stop"]
    if(stop=="false"):
        await sio.emit('message',str('{"color":"'+ random.choice(["green"])+'"}'))
    elif(stop=="true"):
        await sio.emit('message',str('{"color":"white"}'))
    
    return web.Response(text="Sent?")


# app.router.add_get('/', index)
# app.router.add_get('/process', process)
cors.add(app.router.add_get("/",index), {
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers=("X-Custom-Server-Header",),
            allow_headers=("X-Requested-With", "Content-Type"),
            max_age=3600,
        )
    })
cors.add(app.router.add_get("/process",process), {
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers=("X-Custom-Server-Header",),
            allow_headers=("X-Requested-With", "Content-Type"),
            max_age=3600,
        )
    })

cors.add(app.router.add_post("/save-subscription",save), {
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers=("X-Custom-Server-Header",),
            allow_headers=("X-Requested-With", "Content-Type"),
            max_age=3600,
        )
    })

cors.add(app.router.add_post("/sw_notify",sw_notify), {
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers=("X-Custom-Server-Header",),
            allow_headers=("X-Requested-With", "Content-Type"),
            max_age=3600,
        )
    })

cors.add(app.router.add_post("/ws_notify",ws_notify), {
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers=("X-Custom-Server-Header",),
            allow_headers=("X-Requested-With", "Content-Type"),
            max_age=3600,
        )
    })


app.router.add_static('/static/',path="./static/")

# We kick off our server
if __name__ == '__main__':
    r.flushdb()
    redis_client.flushdb()
    web.run_app(app)