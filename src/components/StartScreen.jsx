export default function StartScreen({ handleClickStart, showStartScreen }) {


    return (
        <div className="start-screen" style={{
            opacity: showStartScreen ? 1 : 0,
            zIndex: showStartScreen ? 1 : -10,
        }}>
            <h1>Welcome to The World of Sound</h1>
            <button onClick={handleClickStart}>Start</button>
        </div>
    );
}