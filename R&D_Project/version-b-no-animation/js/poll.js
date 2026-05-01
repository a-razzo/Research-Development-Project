(function () {
  var pollForm = document.getElementById('weeklyPollForm');
  var pollSubmitBtn = document.getElementById('pollSubmitBtn');
  var pollStatus = document.getElementById('pollStatus');
  var pollResults = document.getElementById('pollResults');
  var pollOnlineIndicator = document.getElementById('pollOnlineIndicator');
  var pollOnlineLabel = document.getElementById('pollOnlineLabel');

  if (!pollForm || !pollSubmitBtn || !pollStatus || !pollResults) {
    return;
  }

  var apiHost = window.location.hostname || 'localhost';
  var API_BASE_URL = 'http://' + apiHost + ':5000';
  var POLL_ID = 'main-poll';
  var VOTER_ID_KEY = 'eh-news-voter-id';
  var VOTED_KEY = 'eh-news-voted-' + POLL_ID;

  var optionLabels = {
    java: 'Java',
    javascript: 'JavaScript'
  };

  var optionAliases = {
    java: ['java', 'option1', 'a'],
    javascript: ['javascript', 'option2', 'b']
  };

  function setOnlineStatus(online) {
    if (!pollOnlineIndicator) return;
    pollOnlineIndicator.classList.toggle('poll-is-online', online);
    pollOnlineIndicator.classList.toggle('poll-is-offline', !online);
    if (pollOnlineLabel) {
      pollOnlineLabel.textContent = online ? 'Poll Online' : 'Poll Offline';
    }
  }

  function getOrCreateVoterId() {
    var id = localStorage.getItem(VOTER_ID_KEY);
    if (id) return id;

    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      id = window.crypto.randomUUID();
    } else {
      id = 'voter-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
    }

    localStorage.setItem(VOTER_ID_KEY, id);
    return id;
  }

  function setPollLocked(locked) {
    pollSubmitBtn.disabled = locked;
    pollForm.querySelectorAll('input[name="poll"]').forEach(function (input) {
      input.disabled = locked;
    });
  }

  function renderResults(data) {
    var rows = Array.isArray(data.results) ? data.results : [];

    var tally = { java: 0, javascript: 0 };
    rows.forEach(function (row) {
      var normalized = String(row.option || '').toLowerCase();
      if (optionAliases.java.includes(normalized)) {
        tally.java += Number(row.votes) || 0;
      } else if (optionAliases.javascript.includes(normalized)) {
        tally.javascript += Number(row.votes) || 0;
      }
    });

    var visibleTotal = tally.java + tally.javascript;
    if (!visibleTotal) {
      pollResults.innerHTML = '<p class="poll-no-votes-message">No votes yet. Be the first to vote.</p>';
      return;
    }

    pollResults.innerHTML = Object.keys(optionLabels).map(function (key) {
      var votes = tally[key] || 0;
      var percent = visibleTotal > 0 ? (votes / visibleTotal) * 100 : 0;

      return (
        '<div class="poll-result-row">' +
          '<div class="poll-result-label-row">' +
            '<span>' + optionLabels[key] + '</span>' +
            '<span>' + votes + ' vote' + (votes === 1 ? '' : 's') + ' (' + percent.toFixed(1) + '%)</span>' +
          '</div>' +
          '<div class="poll-bar-background"><span class="poll-bar-progress" style="width:' + percent + '%"></span></div>' +
        '</div>'
      );
    }).join('');
  }

  function loadResults() {
    return fetch(API_BASE_URL + '/api/poll/' + POLL_ID)
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load results');
        return response.json();
      })
      .then(function (data) {
        setOnlineStatus(true);
        renderResults(data);
      });
  }

  pollForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (localStorage.getItem(VOTED_KEY) === 'true') {
      pollStatus.textContent = 'You have already voted in this poll.';
      setPollLocked(true);
      return;
    }

    var selected = pollForm.querySelector('input[name="poll"]:checked');
    if (!selected) {
      pollStatus.textContent = 'Please choose an option before submitting.';
      return;
    }

    setPollLocked(true);
    pollStatus.textContent = 'Submitting your vote...';

    var voterId = getOrCreateVoterId();

    fetch(API_BASE_URL + '/api/poll/' + POLL_ID + '/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: selected.value, voterId: voterId })
    })
      .then(function (response) {
        if (response.status === 409) {
          localStorage.setItem(VOTED_KEY, 'true');
          pollStatus.textContent = 'You have already voted in this poll. Here are the latest results:';
          return loadResults();
        }
        if (!response.ok) throw new Error('Vote submission failed');
        localStorage.setItem(VOTED_KEY, 'true');
        pollStatus.textContent = 'Vote submitted. Here is what everyone has voted for:';
        return loadResults();
      })
      .catch(function () {
        setOnlineStatus(false);
        pollStatus.textContent = 'Could not connect to the poll server. Make sure Docker is running and the backend is up.';
        setPollLocked(false);
      });
  });

  if (localStorage.getItem(VOTED_KEY) === 'true') {
    setPollLocked(true);
    pollStatus.textContent = 'You have already voted in this poll. Here are the latest results:';
  }

  loadResults().catch(function () {
    setOnlineStatus(false);
    pollStatus.textContent = 'Live poll results are unavailable until the Docker backend starts.';
  });
})();
