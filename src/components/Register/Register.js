import React from 'react';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      name: '',
      error: ''
    };
  }

  onNameChange = (event) => this.setState({ name: event.target.value, error: '' });
  onEmailChange = (event) => this.setState({ email: event.target.value, error: '' });
  onPasswordChange = (event) => this.setState({ password: event.target.value, error: '' });

  onSubmitRegister = async () => {
    const { name, email, password } = this.state;

    if (!name.trim() || !email.trim() || !password.trim()) {
      this.setState({ error: 'All fields are required.' });
      return;
    }

    try {
      const resp = await fetch('https://smart-brain-api-uok1.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await resp.json();

      if (!resp.ok) {
        // backend sends error messages in data.message or just the object
        this.setState({ error: data.message || 'Registration failed.' });
        return;
      }

      // Registration succeeded, save token
      if (data.userId && data.token) {
        window.sessionStorage.setItem('token', data.token);

        // fetch profile
        const profileResp = await fetch(`https://smart-brain-api-uok1.onrender.com/profile/${data.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': data.token
          }
        });

        const user = await profileResp.json();
        if (user && user.email) {
          this.props.loadUser(user);
          this.props.onRouteChange('home');
        } else {
          this.setState({ error: 'Profile could not be loaded.' });
        }
      } else {
        this.setState({ error: 'Registration failed. Invalid response from server.' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      this.setState({ error: 'Registration failed. Please try again later.' });
    }
  };

  render() {
    const { error } = this.state;

    return (
      <article className="br3 mv4 w-90 w-60-m w-25-l mw6 center" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '600', textAlign: 'center', marginBottom: '1rem', textShadow: '0 0 8px rgba(255,255,255,0.2)', userSelect: 'none', minHeight: '40px' }}>
                Register
              </legend>

              {error && <div style={{ color: '#ff4d4d', fontWeight: '600', fontSize: '1rem', marginBottom: '1rem', textAlign: 'center', userSelect: 'none' }}>{error}</div>}

              <div className="mt2">
                <label htmlFor="name" className="db fw6 lh-copy f6" style={{ color: 'rgba(255,255,255,0.9)' }}>Name</label>
                <input type="text" name="name" id="name" onChange={this.onNameChange} className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div className="mt3">
                <label htmlFor="email-address" className="db fw6 lh-copy f6" style={{ color: 'rgba(255,255,255,0.9)' }}>Email</label>
                <input type="email" name="email-address" id="email-address" onChange={this.onEmailChange} className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div className="mv3">
                <label htmlFor="password" className="db fw6 lh-copy f6" style={{ color: 'rgba(255,255,255,0.9)' }}>Password</label>
                <input type="password" name="password" id="password" onChange={this.onPasswordChange} className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </div>
            </fieldset>

            <div>
              <input onClick={this.onSubmitRegister} type="submit" value="Register" className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib white" />
            </div>
          </div>
        </main>
      </article>
    );
  }
}

export default Register;
