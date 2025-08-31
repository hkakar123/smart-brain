import React from 'react';

const inputStyle = {
  borderColor: 'rgba(255, 255, 255, 0.3)',
  color: '#fff',
  borderRadius: '8px',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  transition: 'border-color 0.3s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  padding: '0.5rem',
};

const buttonStyle = {
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#fff',
  fontSize: '1rem',
  padding: '10px 28px',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  cursor: 'pointer',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
  marginTop: '2px',
  letterSpacing: '1px',
  fontWeight: '500',
  width: '63%',
  userSelect: 'none',
};

class Signin extends React.Component {
  state = { signInEmail: '', signInPassword: '', error: '' };

  handleChange = (field) => (e) => this.setState({ [field]: e.target.value, error: '' });

  saveAuthTokenInSession = (token) => window.sessionStorage.setItem('token', token);

  onSubmitSignIn = async () => {
    const { signInEmail, signInPassword } = this.state;

    if (!signInEmail.trim() || !signInPassword.trim()) {
      this.setState({ error: 'Both fields are required.' });
      return;
    }

    try {
      console.log('Submitting sign in:', { signInEmail, signInPassword });

      // 1. Sign in
      const res = await fetch('https://smart-brain-api-uok1.onrender.com/signin', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword })
      });

      const data = await res.json();
      console.log('Backend response:', data);

      if (data.userId && data.success === 'true') {
        this.saveAuthTokenInSession(data.token);

        // 2. Fetch user profile
        const profileRes = await fetch(`https://smart-brain-api-uok1.onrender.com/profile/${data.userId}`, {
          method: 'get',
          headers: { 'Content-Type': 'application/json', 'Authorization': data.token }
        });

        const user = await profileRes.json();
        console.log('Fetched user profile:', user);

        if (user?.email) {
          this.props.loadUser(user);
          this.props.onRouteChange('home');
        } else {
          this.setState({ error: 'Failed to load user profile.' });
        }
      } else {
        this.setState({ error: 'Wrong email or password.' });
      }
    } catch (err) {
      console.error('Sign in error:', err);
      this.setState({ error: 'Unable to sign in. Please try again later.' });
    }
  }

  render() {
    const { onRouteChange } = this.props;
    const { signInEmail, signInPassword, error } = this.state;

    const handleFocus = (e) => (e.target.style.borderColor = '#667eea');
    const handleBlur = (e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)');

    return (
      <article className="br3 mv4 w-90 w-60-m w-25-l mw6 center" style={{
        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)', borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.2)', padding: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset className="ba b--transparent ph0 mh0">
              <legend style={{
                color:'#fff', fontSize:'2.5rem', fontWeight:'600', textAlign:'center',
                marginBottom:'1rem', textShadow:'0 0 8px rgba(255,255,255,0.2)', userSelect:'none',
                minHeight:'40px'
              }}>Sign In</legend>

              {error && <div style={{
                color:'#ff4d4d', fontWeight:'600', fontSize:'1rem', marginBottom:'1rem',
                textAlign:'center', userSelect:'none', fontFamily:'Arial, sans-serif',
                textShadow:'0 0 4px rgba(255,0,0,0.6)'
              }}>{error}</div>}

              {[{ label: 'Email', type: 'email', value: signInEmail, name: 'signInEmail' },
                { label: 'Password', type: 'password', value: signInPassword, name: 'signInPassword' }]
              .map(input => (
                <div className={input.type === 'password' ? 'mv3' : 'mt3'} key={input.name}>
                  <label className="db fw6 lh-copy f6" style={{ color:'rgba(255,255,255,0.9)' }}>{input.label}</label>
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                    style={inputStyle}
                    type={input.type}
                    name={input.name}
                    value={input.value}
                    onChange={this.handleChange(input.name)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              ))}
            </fieldset>

            <div>
              <input
                onClick={this.onSubmitSignIn}
                type="submit"
                value="Sign In"
                style={buttonStyle}
                onMouseEnter={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 12px 24px rgba(0,0,0,0.25)'; e.target.style.background='rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.target.style.transform='none'; e.target.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'; e.target.style.background='rgba(255,255,255,0.15)'; }}
                onMouseDown={e => e.target.style.transform='scale(0.96)'}
                onMouseUp={e => e.target.style.transform='translateY(-2px)'}
              />
            </div>

            <div className="lh-copy mt3">
              <p onClick={() => onRouteChange('register')} className="f6 link dim white db pointer" style={{ textAlign:'center', marginTop:'1rem' }}>Register</p>
            </div>
          </div>
        </main>
      </article>
    );
  }
}

export default Signin;
