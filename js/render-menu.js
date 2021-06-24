const menu = require('../../assets/menu.json');

const menuContainer = document.querySelector('ul.navbar-nav');

menu.forEach(item => {
    let li = document.createElement('li');
    
    li.classList.add('nav-item');
    
    if(item.enabled)
    {
        let a = document.createElement('a');
        a.classList.add('nav-link');
        a.href = item.link;

        if(item.badge.toLowerCase() == "new")
        {
            a.innerHTML = `${item.name} <span class="badge rounded-phill bg-primary">NEW</span>`;
        }
        else if(item.badge.toLowerCase() == 'beta')
        {
            a.innerHTML = `${item.name} <span class="badge rounded-phill bg-danger">BETA</span>`;
        }
        else
        {
            a.innerText = item.name;
        }

        li.appendChild(a);
    }
    else
    {
        let strike = document.createElement('strike');
        strike.innerText = item.name;
        li.appendChild(strike);
    }

    menuContainer.appendChild(li);
});