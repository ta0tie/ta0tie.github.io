var posts=["2025/07/29/hello-anzhiyu/","2025/07/29/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };