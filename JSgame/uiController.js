class uiController {
    constructor(canvas, jsonFilePath) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.containers = [];
        this.loadJson(jsonFilePath);

        // Define buttons
        this.buttons = [
            {
                x: 300,
                y: 150,
                width: 200,
                height: 50,
                text: "Click Me!",
                onClick: () => alert("Button clicked!"),
            },
        ];

        // Attach event listener for clicks
        this.canvas.addEventListener("mousedown", (event) => this.handleClick(event));
    }


    async loadJson(jsonFilePath) {
        try {
            const response = await fetch(jsonFilePath);
            const data = await response.json();
            this.parseJson(data);
            this.renderUI();
        } catch (error) {
            console.error("Failed to load JSON file:", error);
        }
    }


    parseJson(data) {
        data.containers.forEach((container) => {
                let frame = [];
                let buttons = [];
                let texts = [];
                if (container.frame) {
                    container.frame = new uiFrame(container.frame);
                }
                if (container.buttons) {
                    container.buttons = container.buttons.map((button) => new uiButton(button));
                }
                if (container.texts) {
                    container.texts = container.texts.map((text) => new uiText(text));
                }
            this.containers.push(new uiContainer(frame, buttons, texts));
        })
    };

    renderUI() {
    };

    // Draw all UI elements
    draw() {
        this.buttons.forEach((button) => this.drawButton(button));
    }

    // Draw a single button
    drawButton(button) {
        const { x, y, width, height, text } = button;
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "center";  
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, x + width / 2, y + height / 2);
    }

    // Handle click events
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.buttons.forEach((button) => {
            if (
                mouseX > button.x &&
                mouseX < button.x + button.width &&
                mouseY > button.y &&
                mouseY < button.y + button.height
            ) {
                button.onClick(); // Trigger button's onClick handler
            }
        });
    }
}

// Export UI module
export { uiController };

class uiContainer{
    constructor(frame, buttonArray, textArray) {
        this.frame = frame;
        this.buttons = buttonArray;
        this.texts = textArray;
    }

    render(params) {
        
    }
  }

class uiFrame{

}

class uiButton{

}

class uiText{

}
