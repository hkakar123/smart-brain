import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

class ProfileIcon extends React.Component {
  constructor(props){
    super(props);
    this.state = { dropdownOpen: false };
  }

  toggle = () => {
    this.setState(prevState => ({ dropdownOpen: !prevState.dropdownOpen }));
  }

  render() {
    const { userAvatar, toggleModal, onRouteChange } = this.props;

    return (
      <div className="pa4 tc">
        <Dropdown
          isOpen={this.state.dropdownOpen}
          toggle={this.toggle}
          // Popper modifier to prevent clipping
          modifiers={{ preventOverflow: { enabled: true } }}
        >
          <DropdownToggle tag="span" data-toggle="dropdown" aria-expanded={this.state.dropdownOpen}>
            <img 
              src={userAvatar || "http://tachyons.io/img/logo.jpg"} 
              className="br-100 ba h3 w3 dib" 
              alt="avatar"
            />
          </DropdownToggle>

          <DropdownMenu 
            className='shadow-2 br4' 
            style={{
              marginTop: '15px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              minWidth: '180px',
            }}
          >
            <DropdownItem 
              onClick={toggleModal}
              style={{padding: '12px 20px', borderRadius: '6px', transition: '0.2s'}}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              View Profile
            </DropdownItem>

            <DropdownItem
              onClick={() => onRouteChange('signout')} 
              style={{padding: '12px 20px', borderRadius: '6px', transition: '0.2s'}}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }
}

export default ProfileIcon;
