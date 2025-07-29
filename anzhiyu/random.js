var posts=["2025/07/29/hello-anzhiyu/","2025/07/29/home_top-peoplecanvas(人潮涌动)魔改/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };