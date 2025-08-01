var posts=["posts/aurorabackground.html","posts/d87f7e0c.html","posts/50923400.html","posts/peoplecanvas.html"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };