const socket = io();

var general_info;
socket.on('updated info', (info) => {
    general_info = info;
})

socket.on('info', (info) => {
    general_info = info;
    const main = document.querySelector('main')

    for (let eventName in info){
        let eventDiv = document.createElement('div')
        eventDiv.classList.add('event')

        let titleTag = document.createElement('h2')
        titleTag.textContent = eventName
        eventDiv.appendChild(titleTag)

        if (Array.isArray(info[eventName])) {
            let subTextTag = document.createElement('p')
            subTextTag.textContent = info[eventName].length + " entries"
            subTextTag.setAttribute('id', 'entryCount')
            eventDiv.appendChild(subTextTag)

            let eventList = document.createElement('ui')
            eventList.classList.add('runners')
            
            let i=1
            info[eventName].forEach((athlete) => {
                let athleteBulletPoint = document.createElement('li')
                athleteBulletPoint.textContent = athlete

                let popupRemoveButtonDiv = document.createElement('div')
                popupRemoveButtonDiv.classList.add('popup')

                let removeButton = document.createElement('button')
                removeButton.textContent = '✕'

                popupRemoveButtonDiv.appendChild(removeButton)
                athleteBulletPoint.appendChild(popupRemoveButtonDiv)

                removeButton.addEventListener('click', (e) => {
                    socket.emit('remove athlete', ([athlete, eventName]))
                });

                if (eventName.includes('x')){
                    let relayNum = document.createElement('span')
                    relayNum.classList.add('relay-label')
                    relayNum.textContent = 'Relay' + i + ": "
                    eventList.appendChild(relayNum)
                    i++
                }

                eventList.appendChild(athleteBulletPoint)


            })

            eventDiv.appendChild(eventList)
            
            let addrunnerContainer = document.createElement('div')
            addrunnerContainer.classList.add('add-runner-container')

            let addButton = document.createElement('button')
            addButton.textContent = '+'
            addButton.classList.add('add-runner-btn')
            addrunnerContainer.appendChild(addButton)

            let addrunnerForm = document.createElement('div')
            addrunnerForm.classList.add('add-runner-form')

            let inputRunner = document.createElement('input')
            let submitButton = document.createElement('button')
            submitButton.textContent = '✔'
            submitButton.classList.add('submit-btn')

            addrunnerForm.appendChild(inputRunner)
            addrunnerForm.appendChild(submitButton)

            addrunnerContainer.appendChild(addrunnerForm)

            eventDiv.appendChild(addrunnerContainer)

            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (addrunnerForm.style.display == 'none')
                    addrunnerForm.style.display = 'flex';
                else addrunnerForm.style.display = 'none';
            });

            submitButton.addEventListener('click', (e) => {
                e.stopPropagation();

                socket.emit('add athlete', ([addrunnerForm.querySelector('input').value, eventName]))

                addrunnerForm.style.display = 'none';
                addrunnerForm.querySelector('input').value = '';

            });
        }
        else {
            let subTextTag = document.createElement('p')
            subTextTag.textContent = Object.keys(info[eventName]).length + " entries"
            subTextTag.setAttribute('id', 'entryCount')
            eventDiv.appendChild(subTextTag)
        }

        eventDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.add-runner-container') && !e.target.closest('.popup')){
                eventDiv.classList.toggle('active');
                let runnerForm = eventDiv.querySelector('.add-runner-container').querySelector('.add-runner-form')
                runnerForm.style.display = 'none'
            }

        });

        main.appendChild(eventDiv)
    }
})

socket.on('add backend athlete', (info) => {
    let athleteName = info[0]
    let eventName = info[1]
    let athleteNumber = info[2]
    let athleteBulletPoint = document.createElement('li')
    
    athleteBulletPoint.textContent = athleteName

    let popupRemoveButtonDiv = document.createElement('div')
    popupRemoveButtonDiv.classList.add('popup')

    let removeButton = document.createElement('button')
    removeButton.textContent = '✕'

    popupRemoveButtonDiv.appendChild(removeButton)
    athleteBulletPoint.appendChild(popupRemoveButtonDiv)

    removeButton.addEventListener('click', (e) => {
        socket.emit('remove athlete', ([athleteName, eventName]))
    });
    
    events = document.querySelectorAll('.event')
    for (let event in events) {
        if (events[event].querySelector('h2').textContent == eventName){
            if (events[event].textContent.includes('x')){
                let relayElements = events[event].querySelectorAll('span')

                let relayNum = document.createElement('span')
                relayNum.classList.add('relay-label')
                relayNum.textContent = 'Relay' + (relayElements.length+1) + ": "
                events[event].querySelector('ui').appendChild(relayNum)

                for (let i=0; i<relayElements.length; i++){
                    relayElements[i].textContent = "Relay " + (i+1) + ": "
                }
            }
            events[event].querySelector('ui').appendChild(athleteBulletPoint)
            events[event].querySelector('p').textContent = events[event].querySelectorAll('li').length + " entries"
        }
    }
})

socket.on('remove backend athlete', (info) => {
    let athleteName = info[0]
    let eventName = info[1]
    
    events = document.querySelectorAll('.event')
    for (let event in events) {
        
        if (events[event].querySelector('h2').textContent == eventName){

            let athleteList = events[event].querySelectorAll('li')
            for (let i=0; i<athleteList.length; i++){
                if (athleteList[i].textContent == athleteName + "✕"){
                    athleteList[i].remove()

                    if (events[event].textContent.includes('x')){
                        events[event].querySelector('ui').querySelectorAll('span')[i].remove()
                    }

                    events[event].querySelector('p').textContent = events[event].querySelectorAll('li').length + " entries"
                }
            }

        }

        if (events[event].textContent.includes('x')){
            let relayElements = events[event].querySelectorAll('span')
            for (let i=0; i<relayElements.length; i++){
                relayElements[i].textContent = "Relay " + (i+1) + ": "
            }
        }

    }

})