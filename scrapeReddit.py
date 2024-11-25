import os
import praw
import requests
import shutil

reddit = praw.Reddit(
    client_id=os.environ["CLIENT_ID"],
    client_secret=os.environ["CLIENT_SECRET"],
    username=os.environ["USERNAME"],
    password=os.environ["PASSWORD"],
    user_agent=os.environ["USER_AGENT"],
)

subreddits = ['dankmemes', '196', 'playboicarti', 'blackpeopletwitter', 'whitepeopletwitter']

# Clear existing image folders
for idx in range(1, 6):
    image_folder = f'images{idx}'
    if os.path.exists(image_folder):
        shutil.rmtree(image_folder)
    os.makedirs(image_folder, exist_ok=True)

for idx, subreddit_name in enumerate(subreddits, start=1):
    image_folder = f'images{idx}'
    image_posts = []
    posts = reddit.subreddit(subreddit_name).top(time_filter="day", limit=100)
    for post in posts:
        if post.url.endswith(('.jpg', '.jpeg', '.png')):
            image_posts.append(post)
            if len(image_posts) == 24:
                break
    for post in image_posts:
        image_url = post.url
        response = requests.get(image_url)
        if response.status_code == 200:
            image_path = os.path.join(image_folder, f"{post.id}.jpg")
            with open(image_path, 'wb') as f:
                f.write(response.content)
            print(f"Image saved to {image_path}")
            # Print associated text
            print(f"Title: {post.title}")
            if post.selftext:
                print(f"Text: {post.selftext}")
        else:
            print(f"Failed to download image from {image_url}")