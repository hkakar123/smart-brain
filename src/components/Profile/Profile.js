import React from 'react';
import './Profile.css';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.user.name,
      age: props.user.age,
      pet: props.user.pet,
      avatarFile: null,
      avatarPreview: props.user.avatar || "https://i.pinimg.com/474x/9c/b0/70/9cb070d62dc738a0c3a1a408d68e4af5.jpg",
      saving: false,      
      error: null          
    };
  }

  onFormChange = (event) => {
    const { name, value } = event.target;
    if (name === 'user-name') this.setState({ name: value });
    if (name === 'user-age') this.setState({ age: value });
    if (name === 'user-pet') this.setState({ pet: value });
  }

  onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ avatarFile: file });
      const reader = new FileReader();
      reader.onload = () => this.setState({ avatarPreview: reader.result });
      reader.readAsDataURL(file);
    }
  }

  onProfileUpdate = async () => {
    const { name, age, pet, avatarFile } = this.state;
    let avatar = this.state.avatarPreview;

    this.setState({ saving: true, error: null });

    // convert file to Base64 if new avatar is uploaded
    if (avatarFile) {
      avatar = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(avatarFile);
      });
    }

    const body = {
      name,
      age: age ? Number(age) : undefined,  // ensure age is number
      pet,
      avatar
    };

    try {
      const resp = await fetch(`https://smart-brain-api-uok1.onrender.com/profile/${this.props.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': window.sessionStorage.getItem('token')
        },
        body: JSON.stringify(body)
      });

      const updatedUser = await resp.json();

      if (updatedUser.id) { // backend returned updated user
        this.props.loadUser(updatedUser);
        this.props.toggleModal();
      } else {
        this.setState({ error: 'Failed to update profile. Please try again.' });
        console.error('Update failed:', updatedUser);
      }

    } catch (err) {
      this.setState({ error: 'Error updating profile. Please try again.' });
      console.error('Profile update error:', err);
    } finally {
      this.setState({ saving: false });
    }
  }

  render() {
    const { name, age, pet, avatarPreview, saving, error } = this.state;
    const { user, toggleModal } = this.props;

    return (
      <div className="profile-modal">
        <article className="profile-card">
          <div className="modal-close" onClick={toggleModal}>&times;</div>
          <main className="profile-content">

            <img src={avatarPreview} alt="avatar" className="profile-avatar" />

            <h1 className="profile-title">{name}</h1>

            <div className="profile-static-info">
              <p>{`Images submitted: ${user.entries}`}</p>
              <p>{`Member since: ${new Date(user.joined).toLocaleDateString()}`}</p>
              <p>{`Age: ${user.age}`}</p>
              <p>{`Pet: ${user.pet}`}</p>
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <label>Name</label>
                <input type="text" name="user-name" value={name} onChange={this.onFormChange} />
              </div>

              <div className="profile-field">
                <label>Age</label>
                <input type="number" name="user-age" value={age} onChange={this.onFormChange} />
              </div>

              <div className="profile-field">
                <label>Pet</label>
                <input type="text" name="user-pet" value={pet} onChange={this.onFormChange} />
              </div>

              <div className="profile-field">
                <label>Upload Avatar</label>
                <div className="file-upload">
                  <label className="file-upload-label">
                    {this.state.avatarFile ? this.state.avatarFile.name : "Choose file"}
                    <input type="file" accept="image/*" onChange={this.onFileChange} />
                  </label>
                </div>
              </div>
            </div>

            {error && <p className="profile-error">{error}</p>}

            <div className="profile-buttons">
              <button className="save-btn" onClick={this.onProfileUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={toggleModal}>Cancel</button>
            </div>

          </main>
        </article>
      </div>
    );
  }
}

export default Profile;
