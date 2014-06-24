/**
 * @jsx React.DOM
 */

var api = require('../request');
var adminui = require('../adminui');
var React = require('react');
var moment = require('moment');

module.exports = React.createClass({
    propTypes: {
        'user': React.PropTypes.string.isRequired
    },
    getInitialState: function() {
        return { menu: false, alarms: [], probes: {} };
    },
    toggleMenu: function() {
        this.setState({menu: !this.state.menu});
    },
    componentWillMount: function() {
        this.fetchAlarms();
        adminui.vent.on('alarms:changed', this.fetchAlarms);
        this._interval = setInterval(this.fetchAlarms, 10000);
    },
    componentWillUnmount: function() {
        adminui.vent.off('alarms:changed', this.fetchAlarms);
        clearInterval(this._interval);
    },
    fetchProbeGroup: function(id) {
        this.setState({loading: true});
        api.get('/api/amon/probegroups/'+this.props.user + '/' + id).end(function(err, res) {
            var probes = this.state.probes;
            probes[id] = res.body;
            if (res.ok) {
                this.setState({probes: probes});
            }
        }.bind(this));
    },
    fetchProbe: function(id) {
        this.setState({loading: true});
        api.get('/api/amon/probes/'+this.props.user + '/' + id).end(function(err, res) {
            var probes = this.state.probes;
            probes[id] = res.body;
            if (res.ok) {
                this.setState({probes: probes});
            }
        }.bind(this));
    },
    fetchAlarms: function() {
        var user = this.props.user;
        api.get('/api/amon/alarms').query({user: user, state:'open'}).end(function(res) {
            if (res.ok) {
                var alarms = res.body;
                this.setState({alarms: alarms});
                alarms.map(function(a) {
                    if (a.probe) {
                        this.fetchProbe(a.probe);
                    }
                    if (a.probeGroup) {
                        this.fetchProbeGroup(a.probeGroup);
                    }
                }.bind(this));
            } else {
                console.error('Error fetching alarms', res.text);
                this.setState({error: res.body});
            }
        }.bind(this));
    },
    gotoAlarm: function(alarm) {
        console.log('go to alarm', alarm);
        adminui.vent.trigger('showcomponent', 'alarm', { user: alarm.user, id: alarm.id.toString() });
    },
    renderMenuItem: function(alarm) {
        var probe = this.state.probes[alarm.probe || alarm.probeGroup];

        return (<div className="alarm-menu-item" key={alarm.id}>
            <div className="alarm-menu-item-header">
                <div className="alarm-menu-item-icon">
                    <i className="fa fa-warning"></i>
                </div>
                {
                    probe && probe.length ?
                    <a onClick={this.gotoAlarm.bind(null, alarm)} className="probe">
                        <span className="probe-name">{probe.name}</span>
                        <span className="probe-type">{probe.type}</span>
                    </a> :
                    <a onClick={this.gotoAlarm.bind(null, alarm)} className="probe"><span className="probe-name">{probe.name}</span></a>
                }
                <div className="alarm-lastevent">
                <i className="fa fa-clock-o"></i> { moment(1403280834534).fromNow(true) }
                </div>
            </div>
            <div className="alarm-menu-item-content">
                <div className="faults">
                {alarm.faults.map(function(f) {
                    return <div className="fault">{f.event.data.message}</div>;
                })}
                </div>
            </div>
        </div>);
    },
    menu: function() {
        if (this.state.menu) {
            if (this.state.error) {
                return <div className="alarms-menu">
                    <div className="alarm-menu-item error">
                        <div className="alarm-menu-item-header">
                            <div className="alarm-menu-item-icon">
                                <i className="fa fa-warning"></i>
                            </div>
                            Error Retrieving Alarms
                        </div>
                        <div className="alarm-menu-item-content">
                            amon said: {this.state.error.message}
                        </div>
                    </div>
                </div>;
            }

            if (this.state.alarms.length) {
                return <div className="alarms-menu">
                    {this.state.alarms.map(this.renderMenuItem, this)}
                </div>;
            } else {
                return <div id="alarms-menu" className="alarms-menu">
                    <div className="alarm-menu-item no-alarms">
                        <div className="alarm-menu-item-content">
                            <i className="fa fa-check"></i> There are no open alarms at this time.
                        </div>
                    </div>
                </div>;
            }
        } else {
            return '';
        }
    },
    render: function() {
        var toggleMenu = this.state.error ?
            <a onClick={this.toggleMenu} className={
                ('toggle ' + (this.state.menu ? ' active ' : '' ) + (this.state.error ? ' has-error' : '' ))
            }><i className="fa fa-warning"></i> E</a>
            :
            <a onClick={this.toggleMenu} className={
                ('toggle ' + (this.state.menu ? ' active ' : '' ) + (this.state.alarms.length ? ' has-alarms ' : '' ))
            }><i className="fa fa-bell"></i> { this.state.alarms.length }</a>;

        return <div className="alarms-menu-container">
            {toggleMenu}
            {this.menu()}
        </div>;
    }
});
