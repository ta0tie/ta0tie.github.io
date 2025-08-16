var posts=["posts/d87f7e0c.html","posts/6153d92.html","posts/aurorabackground.html","posts/50923400.html","posts/de52e8d6.html","posts/peoplecanvas.html","posts/algebrabasic.html","posts/numbertheory.html"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };