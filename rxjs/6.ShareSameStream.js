$(()=>{
  const refreshBtn = $(".refresh");
  const refreshButtonS = Rx.Observable.fromEvent(refreshBtn, 'click');


  const startInitStream = Rx.Observable.just('https://api.github.com/users');

  const requestOnRefreshStream = refreshButtonS.map(ev => {
    var randomOffset = Math.floor(Math.random() * 500);
    return "https://api.github.com/users?since="+randomOffset;
  });

  // ----u-----------------t-->
  //     startWith(null)
  // null----u-------------t-->
  // ----------null---null---->
  //         merge
  // null----u-null---null-t-->

  const responseStream = requestOnRefreshStream.merge(startInitStream)
  .flatMap(requestUrl =>{
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  })
  //shareReplay, so that only one call to network
  .shareReplay(1);
  const createSuggestionStream = (stream)=>{
    return stream.map(listOfUser => {
      return listOfUser[Math.floor(Math.random() * listOfUser.length)];
    })
    //onstart hide data
    .startWith(null)
    //while refresh hide data
    .merge(requestOnRefreshStream.map(ev=> null));
  };
  const suggestion1 = createSuggestionStream(responseStream);
  const suggestion2 = createSuggestionStream(responseStream);
  const suggestion3 = createSuggestionStream(responseStream);

  const renderUser = (user, selector) => {
    if(user == null){
      $(selector).hide();
    }else{
      $(selector).show().text(JSON.stringify({
        href: user.html_url,
        login: user.login,
        img: user.avatar_url
      }, null, 4));
    }
  };
  suggestion1.subscribe((user)=>{
    renderUser(user, "#user1");
  });
  suggestion2.subscribe((user)=>{
    renderUser(user, "#user2");
  });
  suggestion3.subscribe((user)=>{
    renderUser(user, "#user3");
  });
});
