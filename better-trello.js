var loadCardDetailsInjector = function() {
  var members = null
  Trello.get('boards/' + boardId + '/members', function(loadedMembers) {
    members = loadedMembers;
  });

  var getCards = function() {
    if (members === null) {
      setTimeout(getCards, 50);
      return;
    }

    var findMember = function(id) {
      for (var i = 0; i < members.length; i++) {
        if (members[i].id === id) {
          return members[i];
        }
      }
      return null;
    }

    var cardsLeft = 0;
    var enrichCard = function(card) {
      var cardDiv = $('#front-' + card.idShort);
      if (cardDiv.length < 1) {
        setTimeout(function() {enrichCard(card)}, 50);
        return;
      }

      if (card.due) {
        var dueDate = new Date(card.due);
        var text = "Fällig: ";
        if (dueDate.getDate() < 10) {
          text = text + "0";
        }
        text = text + dueDate.getDate() + "."
        if (dueDate.getMonth() < 10) {
          text = text + "0";
        }
        text = text + dueDate.getMonth()
        cardDiv.find('.footer .points').text(text + "." + dueDate.getFullYear());
      }
      cardsLeft = cardsLeft - 1;
      if (cardsLeft < 1) {
        window.print();
      }

      if (card.idMembers.length > 0) {
        names = [];
        for (var i = 0; i < card.idMembers.length; i++) {
          var member = findMember(card.idMembers[i]);
          names.push(member.fullName);
        }

        var nameContainer = cardDiv.find('.labels').empty();
        for (var i = 0; i < names.length; i++) {
          var span = $('<span class="label"></span>').text(names[i])
          nameContainer.append(span);
        }
      }
    }

    Trello.get('boards/' + boardId + '/cards/open', function(cards) {
      cardsLeft = cards.length;
      for (var i = 0; i < cards.length; i++) {
        enrichCard(cards[i]);
      }
    });
  }
  getCards();
}

var insertCardLoaderIntoPage = function(boardId) {
  var executableString = "(function() {var boardId = '" + boardId + "';(" + loadCardDetailsInjector.toString() + ")()})()";

  var script = document.createElement('script');
  script.textContent = executableString;
  (document.head||document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}

var setBoardId = function() {
  var boardId = $(this).data('board-id');
  insertCardLoaderIntoPage(boardId);
}
jQuery('body').on('click', '.project button', setBoardId);