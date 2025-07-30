var posts=["posts/50923400.html","posts/a20eaabb.html","posts/d87f7e0c.html"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };