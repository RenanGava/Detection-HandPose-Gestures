
const config = {
    video: { width: 600, height: 400, fps: 30 }
}


async function main() {

    const video = document.querySelector("#webcam")
    const canvas = document.querySelector("#canva")
    const ctx = canvas.getContext("2d")

    const model = window.handPoseDetection.SupportedModels.MediaPipeHands;

    const detectorConfig = {
        runtime: 'tfjs',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        maxHands: 2,
        modelType: 'full'
    }

    // detecta as mãos na webcam
    const detector = await window.handPoseDetection.createDetector(model, detectorConfig)

    const knownGestures = [
        fp.Gestures.VictoryGesture,
        fp.Gestures.ThumbsUpGesture
    ]

    const GE = new fp.GestureEstimator(knownGestures)



    const estimatedHands = async () => {

        ctx.clearRect(0, 0, config.video.width, config.video.height)


        // usando Tensorflow para pegar e desenhar as mãos na imagem
        const hands = await detector.estimateHands(video, {
            flipHorizontal: true
        })


        for (const hand of hands) {

            // console.log(hand);
            const estimatedGestures = GE.estimate(hand.keypoints3D, 9)

            IdentifierGestures(estimatedGestures.poseData, hand.keypoints)
            CordinatesHand(hand)
            FingerOrientation(hand.handedness, estimatedGestures.poseData)

            for (const keypoints of hand.keypoints) {
                const name = keypoints.name.split("_")[0].toString().toLowerCase()

                // declarado mais acima
                drawPointsHand(ctx, keypoints.x, keypoints.y, 10, hand.handedness)
                drawPointLines(ctx, hand.keypoints, hand.handedness)
            }
        }
        setTimeout(() => { estimatedHands() }, 1000 / config.video.fps)
    }


    estimatedHands()
    console.log("Inicio da captura das mãos")
}


// config padrao de linhas das maos
// const HAND_KEYPOINTS_PAIRS = [
//     [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7],
//     [7, 8], [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14],
//     [14, 15], [15, 16], [0, 17], [17, 18], [18, 19], [19, 20]
// ];

const HAND_KEYPOINTS_PAIRS = [
    [0, 1], [0, 5], [0, 9], [1, 2], [2, 3], [2, 5], [3, 4], [5, 6], [5, 9],
    [6, 7], [7, 8], [9, 10], [9, 13], [10, 11], [11, 12], [0, 13],
    [13, 14], [13, 17], [14, 15], [15, 16], [0, 17], [17, 18], [18, 19], [19, 20]
];

async function drawPointLines(ctx, keypoints, handness) {
    ctx.beginPath()
    HAND_KEYPOINTS_PAIRS.map(pairs => {
        ctx.lineWidth = 5
        ctx.moveTo(keypoints[pairs[0]].x, keypoints[pairs[0]].y)
        ctx.lineTo(keypoints[pairs[1]].x, keypoints[pairs[1]].y)
    })
    ctx.strokeStyle = handness === "Right" ? "blue" : "red"
    ctx.stroke();

}

function drawPointsHand(ctx, x, y, r, handness) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 10 * Math.PI)
    ctx.fillStyle = handness === "Right" ? "blue" : "red"
    ctx.fill()

}


function IdentifierGestures(gestures, keipoints) {

    if (gestures[1][0] === "Index") {

        if (gestures[1][1] === "Full Curl") {
            DrawLineHand("white", keipoints)
        }
        else if (gestures[1][1] === "Half Curl") {
            DrawLineHand("black", keipoints)
        }
        else {
            DrawLineHand("blue", keipoints)
        }
    }
}

const lineDraw = []


function DrawLineHand(color, keipoints) {
    const canvas = document.querySelector("#canva")
    const ctx = canvas.getContext("2d")
    lineDraw.push({
        x: keipoints[8].x,
        y: keipoints[8].y,
        color: color
    })

    // DrawLineInCanvaWithHands(lineDraw, ctx)

}

// desenha uma linha seguindo o indicador
function DrawLineInCanvaWithHands(lineDraw, ctx) {
    ctx.beginPath()
    for (line of lineDraw) {
        ctx.lineTo(line.x, line.y)
        ctx.strokeStyle = line.color
        ctx.stroke()
    }
}


var n = 0
function CordinatesHand(hands) {

    // maos
    const handLeft = document.querySelector("#left")
    const handRight = document.querySelector("#right")

    for (handPoint of hands.keypoints) {



        if (hands.handedness === "Right") {

            // FingerOrientation("Right", gestures, handPoint)

            if (handPoint.name === "middle_finger_mcp") {
                // center hand Right
                handRight.children[1].innerHTML = handPoint.x.toFixed(2)
                handRight.children[2].innerHTML = handPoint.y.toFixed(2)
            }

        }

        if (hands.handedness === "Left") {

            // FingerOrientation("Left", gestures, handPoint)

            if (handPoint.name === "middle_finger_mcp") {
                // center hand Left
                handLeft.children[1].innerHTML = handPoint.x.toFixed(2)
                handLeft.children[2].innerHTML = handPoint.y.toFixed(2)
            }


        }

    }

}


function FingerOrientation(chosenHands, gestures) {


    console.log(chosenHands);

    for (let i in gestures) {
        console.log(gestures[i][1]);
        document.querySelector(`#${chosenHands} span#curl-${i}`).innerHTML = gestures[i][1]
        document.querySelector(`#${chosenHands} span#dir-${i}`).innerHTML = gestures[i][2]
    }



}


// função inicia a camera
async function initCamera(width, height, fps) {

    const configVideo = {
        audio: false,
        video: {
            facingMode: "user",
            width: width,
            height: height,
            frameRate: { max: fps }
        }
    }

    const video = document.querySelector("#webcam")
    video.width = width
    video.height = height


    // pegamos aqui a imagem e repassamos para a tag <video>
    const streamWebCam = await navigator.mediaDevices.getUserMedia(configVideo)
    video.srcObject = streamWebCam

    return new Promise(resolve => {
        video.onloadedmetadata = () => { resolve(video) }
    })
}


window.addEventListener("DOMContentLoaded", () => {
    initCamera(config.video.width, config.video.height, config.video.fps).then(video => {
        video.play()
        video.addEventListener("loadeddata", event => {
            console.log("Camera is ready");
            main()
        })
    })

    const canvas = document.querySelector("#canva")
    canvas.width = config.video.width
    canvas.height = config.video.height
    console.log("Canvas initialized")
})