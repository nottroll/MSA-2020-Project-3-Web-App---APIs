# Collaborative Drawing Canvas
This project is part of Microsoft Student Accelerator 2020: Web Apps and APIs and is a simple collaborative drawing app using Flask-SocketIO.

## Summary
Built using HTML5 Canvas and Flask-SocketIO, this project is intented to be a realtime drawing canvas and is inspired by modern collaborative tools such as Google Docs and Microsoft Word Online. However in this the making of this web app, many challenges arose and mainly revolved around the transition from the local development environment to the production environment. Although the app functions well locally, it struggles with in its deployed state with long latency and updates between clients occuring extremely slowly if at all. At this stage, I am unsure how to diagnose this problem.

Nonetheless the website is deployed to Azure: http://msa-collabdraw.azurewebsites.net/ 

For the intended experience please run the project locally.
![](demo.gif)

## Dependencies
    python==3.7.7
    eventlet==0.27.0
    Flask==1.1.2
    Flask-SocketIO==4.3.1

## Running Locally
To run this application locally, simply install the dependencies listed either globally or in a virtual environment. Then using `flask run`.

## What I learnt
- HTML5 Canvas is easy to get started with but becomes much more challenging when dealing with variable window sizes to find the relative mouse position.
- Deployment issues are incredibly challenging to diagnose for a beginner.
- Flask-SocketIO is a powerful tool for realtime applications and demonstrates why WebSocket is so widely used today.
- I will need to revisit this project when I have gained more experience.

## Selected References
https://github.com/JerryyZhu/todo_markdown

https://github.com/socketio/socket.io/blob/master/examples/whiteboard/public/main.js

https://github.com/Exaphis/collab-whiteboard

https://flask-socketio.readthedocs.io/en/latest/
