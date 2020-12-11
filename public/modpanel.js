let times = [];
let counts = [];
let users = [];
let ctx1 = document.getElementById('line').getContext('2d');
let review = document.getElementsByClassName('review')[0];
let chart1;
let chart2;
if (localStorage.getItem('times') != undefined) {
  times = localStorage.getItem('times').split(',');
}
if (localStorage.getItem('counts') != undefined) {
  counts = localStorage.getItem('counts').split(',');
}
let refresh = () => {
  fetch('/api/report/count')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      let time = new Date;
      time = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
      console.log('Pushing time ' + time);
      times.push(time);
      localStorage.setItem('times', times.toString());
      counts.push(data.count);
      localStorage.setItem('counts', counts.toString());
      try {
        chart1.destroy();
      } catch {
        console.log('Error with destruction of chart');
      }
      chart1 = new Chart(ctx1, {
        // The type of chart we want to create
        type: 'line',
        data: {
          labels: times,
          datasets: [{
            label: 'total reports',
            backgroundColor: '#6F00FF',
            borderColor: '#000000',
            data: counts
          }]
        },
        // Configuration options go here
        options: {
          title: {
            text: 'Reports over time',
            display: true,
            position: 'top',
            fontSize: 24,
            fontColor: 'black'
          },
          responsive: true,
          scales: {
            yAxes: [{
              ticks: {
                stepSize: 1
              }
            }]
          },
          layout: {
            padding: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20
            }
          }
        }
      });
    })
  fetch('/api/report/all')
    .then((res) => {
      return res.json();
    })
    .then((reports) => {
      review.innerHTML = "";
      reports.forEach((item, i) => {
        let div = document.createElement('div');
        div.classList.add('report');
        div.innerHTML = `
        <span class="reported-message" data-post-id="${item.id}">${item.message}</span><br>
        <div class="options">
          <a href="#ban" aria-label="Ban @${item.user} from Modchat" data-balloon-pos="down" data-user="${item.user}">Ban</a> <a href="#reject" aria-label="Reject this report as spam" data-balloon-pos="down" data-post-id="${item.id}">Reject</a> <a href="#" aria-label="Delete this message from Modchat" data-balloon-pos="down">Delete</a>
        </div>
        `;
        review.appendChild(div);
      })
      updateEls();
    });
}

window.addEventListener('load', () => {
  refresh();
});

document.getElementById('refreshData').addEventListener('click', () => {
  refresh();
})

document.getElementById('clearData').addEventListener('click', () => {
  localStorage.removeItem('times');
  localStorage.removeItem('counts');
  times = [];
  counts = [];
  refresh();
})

let updateEls = () => {
  var reject = document.querySelectorAll('a[href="#reject"]');
  reject.forEach((item, i) => {
    console.log('Found 1');
    item.addEventListener('click', (e) => {
      e.preventDefault();
      let data = {
        "id": item.getAttribute('data-post-id')
      }
      fetch('/api/report/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log('Rejected report of post ' + item.getAttribute('data-post-id'));
      let parentEl = e.target.parentElement.parentElement;
      parentEl.remove();
    })
  })
  var ban = document.querySelectorAll('a[href="#ban"]');
  ban.forEach((item, i) => {
    console.log('Found 1');
    item.addEventListener('click', (e) => {
      e.preventDefault();
      let data = {
        "id": item.getAttribute('data-post-id'),
        "user": item.getAttribute('data-user')
      }
      fetch('/api/report/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log('Banned author of post ' + item.getAttribute('data-post-id'));
      let parentEl = e.target.parentElement.parentElement;
      parentEl.remove();
    })
  })
}