import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, Shield, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background"></div>
                <div className="container">
                    <div className="hero-content fade-in">
                        <div className="hero-badge">
                            <Zap size={16} />
                            <span>AI-Powered Resolution</span>
                        </div>
                        <h1 className="hero-title">
                            Resolve Disputes with
                            <span className="gradient-text"> AI Intelligence</span>
                        </h1>
                        <p className="hero-description">
                            Experience fair, efficient, and unbiased conflict resolution powered by advanced AI technology.
                            Get intelligent suggestions based on thousands of legal precedents.
                        </p>
                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="btn btn-primary btn-lg">
                                    Go to Dashboard
                                    <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started Free
                                        <ArrowRight size={20} />
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose AI Dispute Resolver?</h2>
                        <p>Cutting-edge technology meets legal expertise</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card slide-in">
                            <div className="feature-icon">
                                <Scale size={32} />
                            </div>
                            <h3>Fair & Unbiased</h3>
                            <p>
                                Our AI analyzes disputes objectively, ensuring fair suggestions based on legal precedents
                                and established patterns, free from human bias.
                            </p>
                        </div>

                        <div className="feature-card slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="feature-icon">
                                <Shield size={32} />
                            </div>
                            <h3>Secure & Private</h3>
                            <p>
                                Your data is encrypted and protected with industry-standard security measures.
                                We prioritize your privacy and confidentiality.
                            </p>
                        </div>

                        <div className="feature-card slide-in" style={{ animationDelay: '0.2s' }}>
                            <div className="feature-icon">
                                <Zap size={32} />
                            </div>
                            <h3>Lightning Fast</h3>
                            <p>
                                Get AI-powered suggestions in seconds. Our advanced algorithms process your dispute
                                and provide actionable insights instantly.
                            </p>
                        </div>

                        <div className="feature-card slide-in" style={{ animationDelay: '0.3s' }}>
                            <div className="feature-icon">
                                <Users size={32} />
                            </div>
                            <h3>User-Friendly</h3>
                            <p>
                                Intuitive interface designed for everyone. No legal expertise required to navigate
                                and resolve your disputes effectively.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Simple steps to resolution</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card fade-in">
                            <div className="step-number">1</div>
                            <h3>Create Account</h3>
                            <p>Sign up with email or Google in seconds</p>
                        </div>

                        <div className="step-card fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="step-number">2</div>
                            <h3>File Dispute</h3>
                            <p>Describe your dispute with relevant details</p>
                        </div>

                        <div className="step-card fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="step-number">3</div>
                            <h3>Get AI Suggestions</h3>
                            <p>Receive intelligent, unbiased recommendations</p>
                        </div>

                        <div className="step-card fade-in" style={{ animationDelay: '0.3s' }}>
                            <div className="step-number">4</div>
                            <h3>Resolve Conflict</h3>
                            <p>Use insights to reach fair resolution</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content fade-in">
                        <h2>Ready to Resolve Your Disputes?</h2>
                        <p>Join thousands of users who trust AI Dispute Resolver for fair conflict resolution</p>
                        <div className="cta-features">
                            <div className="cta-feature">
                                <CheckCircle size={20} />
                                <span>Free to get started</span>
                            </div>
                            <div className="cta-feature">
                                <CheckCircle size={20} />
                                <span>No credit card required</span>
                            </div>
                            <div className="cta-feature">
                                <CheckCircle size={20} />
                                <span>Instant AI suggestions</span>
                            </div>
                        </div>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Get Started Now
                                <ArrowRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2026 AI Dispute Resolver. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
