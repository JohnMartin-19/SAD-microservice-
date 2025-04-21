console.log('Hello John. You already won')

var updateBtns = document.getElementsByClassName("update-cart")

for (var i = 0 ; i< updateBtns.length; i++){
    updateBtns[i].addEventListener('click', function(){
        var eventId = this.dataset.event
        var action = this.dataset.action
        console.log('eventId:',eventId, 'action:', action)

        console.log("USER:",user)
        if(user == 'AnonymousUser'){
            addCookieItem(eventId,action)
        }else{
           updateUserOrder(eventId,action)
        }
    })
}

function addCookieItem(eventId, action){
	console.log('User is not authenticated')

	if (action == 'add'){
		if (cart[eventId] == undefined){
		cart[eventId] = {'quantity':1}

		}else{
			cart[eventId]['quantity'] += 1
		}
	}

	if (action == 'remove'){
		cart[eventId]['quantity'] -= 1

		if (cart[eventId]['quantity'] <= 0){
			console.log('Item should be deleted')
			delete cart[eventId];
		}
	}
	console.log('CART:', cart)
	document.cookie ='cart=' + JSON.stringify(cart) + ";domain=;path=/"
	location.reload()
}


function updateUserOrder(eventId,action){
    var url = '/update_item/'

    fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
            'X-CSRFToken': csrftoken,
        },
        body:JSON.stringify({
            'eventId':eventId,
            'action':action
        })
        })
   .then((response) => {
            return response.json()
        })
    .then((data) => {
            console.log('data:',data)
            location.reload()
        })
    

}