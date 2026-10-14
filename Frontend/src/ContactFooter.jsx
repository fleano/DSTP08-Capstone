import "./App.css";

function ContactFooter() {
    return (
        <div>
            <section id="contact" className="contact-section">
                <h2 className="section-title">Visit & Contact Us</h2>
                <div className="contact-container">
                    <div className="info-item">
                        <h4>📍 Address</h4>
                        <p>123 Culinary Street, Chinatown, Cityville</p>
                    </div>
                    <div className="info-item">
                        <h4>📞 Phone Number</h4>
                        <p>+1 (123) 123-4567</p>
                    </div>
                    <div className="info-item">
                        <h4>🕒 Opening Hours</h4>
                        <p>Tue - Sun: 09:00 AM - 06:00 PM</p>
                    </div>
                </div>
            </section>

            <footer className="homepage-footer">
                <p>Made by DSTP08 group X &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}

export default ContactFooter;
