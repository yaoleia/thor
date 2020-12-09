const request = require('request')
const getRandomId = (len = 10) => parseInt((Math.random() * 9 + 1) * Math.pow(10, len - 1), 10)

async function push(index) {
    const option = {
        url: "http://127.0.0.1:7001/api/push",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        formData: {
            image_url: `/thor/public/wad/${index}_20201208132339_jpg.jpg`,
            device_id: '5525088371',
            uid: getRandomId(),
            quality: 50
        }
    }
    request(option, (error, response, body) => {
        console.log(response.body)
    })
}
// n张数，m循环次数
let n = 100
let m = 10
let timer = setInterval(() => {
    if (--n < 0) {
        n = 100 - 1
        if (!--m) {
            clearTimeout(timer)
            return
        }
    }
    push(n + 1)
}, 800);