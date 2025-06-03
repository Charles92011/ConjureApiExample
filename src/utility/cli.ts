
    // --- ANSI Colors ---
    export enum COLORS {
        reset = "\x1b[0m",
        dim = "\x1b[2m", 
        red = "\x1b[31m",
        green = "\x1b[32m",
        yellow = "\x1b[33m",
        blue = "\x1b[34m",
        brightBlue = "\x1b[94m",
        magenta = "\x1b[35m",
        cyan = "\x1b[36m",
        gray = "\x1b[90m",
        alert = "\x1b[91m",
        info = "\x1b[36m",
        question = "\x1b[97m",
        success = "\x1b[92m",
        failure = "\x1b[95m",
        warning = "\x1b[93m",
        white = "\x1b[37m",
    };

    export enum EMOJIS {
        log = "📝",
        info = "💬",
        loading = "⏳",
        question = "❓",
        working = "⏳",
        success = "🎉",
        // Alternative success emojis:
        // "🎉" - party popper
        // "🌟" - glowing star
        // "👍" - thumbs up
        // "🎯" - direct hit
        // "💪" - flexed biceps
        // "🏆" - trophy
        // "⭐" - star
        // "💯" - hundred points
        failure = "😞",
        // Alternative failure emojis:
        // "💔" - broken heart
        // "🚫" - prohibited
        // "⛔" - no entry
        // "❗" - exclamation
        // "⚠️" - warning
        // "🔴" - red circle
        // "😞" - sad face
        // "👎" - thumbs down
        error = "❌",
        clock = "🕒"

    }

    // --- Readline Setup ---
    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    //     prompt: colorize(COLORS.cyan, "You: "),
    // });

    function colorize(color: COLORS, text: string): string {
        return `${color}${text}${COLORS.reset}`;
    }

    class Cli {

        private static instance: Cli;
        private startTime: number = Date.now();
    
        public static getInstance(): Cli {
            if (!Cli.instance) {
                Cli.instance = new Cli();
            }
            return Cli.instance;
        }

        private prettyPrint(color: COLORS, emoji: EMOJIS, message: string) {
            const colorMessage = colorize(color, message);
            const emojiMessage = `${emoji} ${colorMessage}`;
            console.log(emojiMessage);
        }

        public json(obj: any, color: COLORS = COLORS.white) {
            const colorMessage = colorize(color, JSON.stringify(obj, null, 2));
            console.log(colorMessage);
        }

        public log(message: string) {
            this.prettyPrint(COLORS.gray, EMOJIS.log, message);
        }

        public info(message: string) {
            this.prettyPrint(COLORS.info, EMOJIS.info, message);
        }

        public loading(message: string) {
            this.prettyPrint(COLORS.yellow, EMOJIS.loading, message);
        }

        public question(message: string) {
            this.prettyPrint(COLORS.question, EMOJIS.question, message);
        }       

        public working(message: string) {
            this.prettyPrint(COLORS.blue, EMOJIS.working, message);
        }

        public success(message: string) {
            this.prettyPrint(COLORS.success, EMOJIS.success, message);
        }

        public failure(message: string) {
            this.prettyPrint(COLORS.failure, EMOJIS.failure, message);
        }

        public error(message: string) {
            this.prettyPrint(COLORS.alert, EMOJIS.error, message);
        }
        
        public startClock(message?: string) {
            this.startTime = Date.now();
            if (message) {
                this.working(message);
            }
        }

        public stopClock(message?: string) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            if (message) {
                this.prettyPrint(COLORS.brightBlue, EMOJIS.clock, `${message} ${elapsed.toFixed(2)}s`);
            }
        }
    };

    const cli = Cli.getInstance();
    export default cli;