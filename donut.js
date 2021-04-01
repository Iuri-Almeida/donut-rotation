// função responsável por realizar a multiplicação das matrizes de rotação
function rotation(vector, angles) {

    // desestruturando o vetor
    let [x, y, z] = vector,
        [sinA, cosA, sinB, cosB, sinPHI, cosPHI] = angles

    // rotacionando o vetor no eixo Y
    let rot_Y_x = (cosPHI * x + 0 * y + sinPHI * z),
        rot_Y_y = (0 * x + 1 * y + 0 * z),
        rot_Y_z = (- sinPHI * x + 0 * y + cosPHI * z)

    // rotacionando o vetor no eixo X
    let rot_X_x = (1 * rot_Y_x + 0 * rot_Y_y + 0 * rot_Y_z),
        rot_X_y = (0 * rot_Y_x + cosA * rot_Y_y - sinA * rot_Y_z),
        rot_X_z = (0 * rot_Y_x + sinA * rot_Y_y + cosA * rot_Y_z)

    // rotacionando o vetor no eixo Z
    let rot_Z_x = (cosB * rot_X_x - sinB * rot_X_y + 0 * rot_X_z),
        rot_Z_y = (sinB * rot_X_x + cosB * rot_X_y + 0 * rot_X_z),
        rot_Z_z = (0 * rot_X_x + 0 * rot_X_y + 1 * rot_X_z)

    return [rot_Z_x, rot_Z_y, rot_Z_z]
}


// função responsável por gerar 
function unitVector(vector) {

    // descompactando o vetor
    let [Vx, Vy, Vz] = vector

    // calculando o módulo do vetor
    let mod = (Vx ** 2 + Vy ** 2 + Vz ** 2) ** (1 / 2)

    return [Vx / mod, Vy / mod, Vz / mod]
}

// função responsável por trocar de HSV para RGB
// Ref.: https://gist.github.com/mjackson/5311256
function hsvToRgb(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}


// referenciando a TAG canvas
const canvas = document.querySelector('canvas')

// definindo o contexto
const ctx = canvas.getContext('2d')

// definindo altura e largura da TAG canvas
canvas.style.width = '50%'
canvas.style.height = '50%'

// definindo a largura e altura
const SCREEN_WIDTH = canvas.width,
    SCREEN_HEIGHT = canvas.height

// definindo a cor de fundo
const BACKGROUND_COLOR = '#000'

// definindo a cor inicial do Donut
let [HUE, SATURATION, BRIGHTNESS] = [0, 1, 1]

// definindo os ângulos iniciais dos eixos X e Z
let A = Math.PI / 2,
    B = Math.PI / 2

// definindo o início e fim da rotação dos ângulos θ e ϕ
const THETA_START = 0,
    THETA_END = 2 * Math.PI,
    PHI_START = 0,
    PHI_END = 2 * Math.PI

// definindo o espaçamento
const A_SPACING = 0.07, // ângulo de rotação em Z
    B_SPACING = 0.03, // ângulo de rotação em X
    THETA_SPACING = 0.2, // ângulo de rotação da circunferência
    PHI_SPACING = 0.08, // ângulo de rotação do Donut
    HUE_SPACING = 0.001 // mudança de cor

// definindo 
const SEPARATOR_X = 1.5,
    SEPARATOR_Y = 1.5

// definindo as constantes
const RADIUS_CIRC = 1,
    RADIUS_DONUT = 2,
    DEPTH = 8,
    K1 = 150

// definindo o vetor (0, 1, -1) --> em cima da cabeça do observador
const REF_VECTOR = [0, 1, -1]

// descompactando o vetor unitário
const [VECTOR_X, VECTOR_Y, VECTOR_Z] = unitVector(REF_VECTOR)

// iniciando a função na variável
const donut = () => {

    // definindo a cor de fundo e preenchendo
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    // computando os SENOS e COSSENOS de A e B
    let sinA = Math.sin(A),
        cosA = Math.cos(A),
        sinB = Math.sin(B),
        cosB = Math.cos(B)

    // realizando a rotação
    A += A_SPACING
    B += B_SPACING

    // descompactando as cores RGB
    let [RED, GREEN, BLUE] = hsvToRgb(HUE, SATURATION, BRIGHTNESS)

    // pegando a próxima cor do espectro
    HUE += HUE_SPACING

    // pegando todos os valores de THETA: θ --> [0, 2π]
    for (var theta = THETA_START; theta < THETA_END; theta += THETA_SPACING) {

        // computando os valores do SENO e COSSENO de THETA
        let sinTHETA = Math.sin(theta),
            cosTHETA = Math.cos(theta)

        // pegando todos os valors de PHI: ϕ --> [0, 2π]
        for (var phi = PHI_START; phi < PHI_END; phi += PHI_SPACING) {

            // computando os valores do SENO e COSSENO de PHI
            let sinPHI = Math.sin(phi),
                cosPHI = Math.cos(phi)

            // definindo a parametrização da circunferência
            let circleX = RADIUS_DONUT + RADIUS_CIRC * cosTHETA,
                circleY = RADIUS_CIRC * sinTHETA

            // definindo as coordenadas em R3 após a rotação
            let rotationVector = [circleX, circleY, 0],
                angles = [sinA, cosA, sinB, cosB, sinPHI, cosPHI],
                [x, y, z] = rotation(rotationVector, angles)

            z = DEPTH + z
            let oneOverZ = 1 / z


            // definindo a projeção de cada ponto
            let projX = (SCREEN_WIDTH / 2) + (K1 * oneOverZ * x),
                projY = (SCREEN_HEIGHT / 2) - (K1 * oneOverZ * y)

            // definindo o vetor normal a todos os pontos da superfície
            let normalVector = [cosTHETA, sinTHETA, 0],
                [normalX, normalY, normalZ] = rotation(normalVector, angles)

            // definindo a luminosidade L = (Nx, Ny, Nz) • (Vx, Vy, Vz)
            let L = (normalX * VECTOR_X) + (normalY * VECTOR_Y) + (normalZ * VECTOR_Z)

            // pegando somente pontos que estão de "frente" pra luz
            if (L > 0) {

                // definindo a cor e preenchendo cada elemento na tela
                ctx.fillStyle = `rgba(${RED}, ${GREEN}, ${BLUE}, ${L})`
                ctx.fillRect(projX, projY, SEPARATOR_X, SEPARATOR_Y)
            }
        }
    }
}

// chamando a função em um intervalo de 35 milissegundos
const MILISSECONDS = 35
setInterval(donut, MILISSECONDS)
