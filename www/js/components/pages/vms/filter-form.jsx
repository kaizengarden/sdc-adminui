/**
 * @jsx: React.DDM
 */
var React = require('react');
var _ = require('underscore');

var INPUT_TYPES = {};

INPUT_TYPES.uuid = React.createClass({
    statics: { label: 'UUID' },
    onChange: function(e) {
        this.props.onChange('uuid', e.target.value);
    },
    focusInput: function() {
        this.refs.input.getDOMNode().focus();
    },
    render: function() {
        return <div className="form-group form-group-sm">
            <label className="col-sm-3 control-label">UUID</label>
            <div className="col-sm-4">
                <input ref="input" value={this.props.value} onChange={this.onChange} className="form-control" type="text" name="uuid" placeholder="UUID" />
            </div>
            <div className="col-sm-1">
                <button type="button" onClick={this.props.handleRemoveCriteria.bind(null, 'uuid')} className="btn btn-link btn-block"><i className="fa fa-trash-o"></i></button>
            </div>
        </div>;
    }
});

INPUT_TYPES.alias = React.createClass({
    statics: { label: 'Alias' },
    onChange: function(e) {
        this.props.onChange('alias', e.target.value);
    },
    focusInput: function() {
        this.refs.input.getDOMNode().focus();
    },
    render: function() {
        return <div className="form-group form-group-sm">
            <label className="col-sm-3 control-label">Alias</label>
            <div className="col-sm-5">
                <input ref="input" value={this.props.value} onChange={this.onChange} className="form-control" type="text" name="alias" placeholder="vm alias" />
            </div>
            <div className="col-sm-1">
                <button type="button" onClick={this.props.handleRemoveCriteria.bind(null, 'package_name')} className="btn btn-link btn-block"><i className="fa fa-trash-o"></i></button>
            </div>
        </div>;
    }
});

INPUT_TYPES.package_name = React.createClass({
    statics: { label: 'Package Name' },
    label: 'Package Name',
    onChange: function(e) {
        this.props.onChange('package_name', e.target.value);
    },
    focusInput: function() {
        this.refs.input.getDOMNode().focus();
    },
    render: function() {
        return <div className="form-group form-group-sm">
            <label className="col-sm-3 control-label">Package Name</label>
            <div className="col-sm-5">
                <input ref="input" value={this.props.value} onChange={this.onChange} className="form-control" type="text" name="package_name" placeholder="Package Name" />
            </div>
            <div className="col-sm-1">
                <button type="button" onClick={this.props.handleRemoveCriteria.bind(null, 'package_name')} className="btn btn-link btn-block"><i className="fa fa-trash-o"></i></button>
            </div>
        </div>;
    }
});

INPUT_TYPES.ip = React.createClass({
    statics: { label: 'IP Address' },
    onChange: function(e) {
        this.props.onChange('ip', e.target.value);
    },
    focusInput: function() {
        this.refs.input.getDOMNode().focus();
    },
    render: function() {
        return <div className="form-group form-group-sm">
            <label className="col-sm-3 control-label">IP Address</label>
            <div className="col-sm-5">
                <input ref="input" value={this.props.value} onChange={this.onChange} className="form-control" type="text" name="ip" placeholder="IP Address" />
            </div>
            <div className="col-sm-1">
                <button type="button" onClick={this.props.handleRemoveCriteria.bind(null, 'ip')} className="btn btn-link btn-block"><i className="fa fa-trash-o"></i></button>
            </div>
        </div>;
    }
});

var TypeaheadUser = require('../../../views/typeahead-user');
INPUT_TYPES.owner_uuid = React.createClass({
    statics: { label: 'Owner' },
    onSelectUser: function(u) {
        var uuid = u ? u.get('uuid') : null;
        this.props.onChange('owner_uuid', uuid);
    },
    focusInput: function() {
        this.refs.input.getDOMNode().focus();
    },
    componentDidMount: function() {
        var node = this.refs.input.getDOMNode();
        this.typeahead = new TypeaheadUser({el: node});
        this.typeahead.on('selected', this.onSelectUser);
        this.typeahead.render();
    },
    componentDidUnmount: function() {
        this.typeahead.remove();
    },
    render: function() {
        return <div className="form-group form-group-sm">
            <label className="col-sm-3 control-label">Owner UUID</label>
            <div className="col-sm-5">
                <input ref="input" value={this.props.value} className="form-control" type="text" name="owner_uuid" placeholder="Search by login or uuid" />
            </div>
            <div className="col-sm-1">
                <button type="button" onClick={this.props.handleRemoveCriteria.bind(null, 'owner_uuid')} className="btn btn-link btn-block"><i className="fa fa-trash-o"></i></button>
            </div>
        </div>;
    }
});

INPUT_TYPES.state = React.createClass({
    statics: { label: 'State' },
    onChange: function(e) {
        this.props.onChange('state', e.target.value);
    },
    render: function() {
        return <div className="form-group form-group-sm">
            <label className="col-sm-3 control-label">State</label>
            <div className="col-sm-2">
                <select onChange={this.onChange} value={this.props.value} name="state" className="form-control">
                    <option value="">any</option>
                    <option value="running">running</option>
                    <option value="stopped">stopped</option>
                    <option value="active">active</option>
                    <option value="failed">failed</option>
                    <option value="destroyed">destroyed</option>
                </select>
            </div>
        </div>;
    }
});

var FilterForm = React.createClass({
    propTypes: {
        initialParams: React.PropTypes.object,
        handleSearch: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
        var state = {};
        if (this.props.initialParams && Object.keys(this.props.initialParams).length) {
            state.filterControls = Object.keys(this.props.initialParams).map(function(t) {
                return { type: t };
            });
        } else {
            state.filterControls = [
                { type: "uuid" },
                { type: "state" }
            ];
        }

        state.values = this.props.initialParams;
        return state;
    },
    _onChange: function(prop, value) {
        var values = this.state.values;
        values[prop] = value;
        this.setState({values: values});
    },
    _handleRemoveCriteria: function(type) {
        var filterControls = this.state.filterControls;
        for (var i in filterControls) {
            var f = filterControls[i];
            if (f.type === type) {
                delete filterControls[i];
            }
        }
        var values = this.state.values;
        delete values[type];
        this.setState({
            values: values,
            filterControls: filterControls
        });
    },
    renderFilterControls: function() {
        return this.state.filterControls.map(function(f) {
            var TYPE = INPUT_TYPES[f.type];
            var value = this.state.values[f.type];
            return <TYPE ref={f.type} key={f.type} handleRemoveCriteria={this._handleRemoveCriteria} onChange={this._onChange} value={value} />;
        }, this);
    },
    _addFilter: function() {
        var t = this.refs.filterSelect.getDOMNode().value;
        if (t && t.length) {
            var filterControls = this.state.filterControls;
            filterControls.push({type: t});
            this.setState({filterControls: filterControls}, function() {
                this.refs[t].focusInput();
            }.bind(this));
        }
    },
    render: function() {
        var filterControls = this.state.filterControls;
        var filterSelect = <select ref="filterSelect" className="form-control">
        {
            Object.keys(INPUT_TYPES).filter(function(t) {
                return undefined === _.findWhere(filterControls, {type: t});
            }).map(function(k) {
                var t = INPUT_TYPES[k];
                return <option key={k} value={k}>{t.label}</option>;
            })
        }
        </select>;

        return <div className="panel panel-info">
            <div className="panel-heading">
                Search Options
                <div style={{width:300}} className="pull-right">
                    <div className="row filter-select">
                        <div className="col-sm-8">{filterSelect}</div>
                        <div className="col-sm-4">
                            <button onClick={this._addFilter} className="btn btn-link pull-right" type="button"><i className="fa fa-plus"></i> Add Filter</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel-body">
                <form className="form form-horizontal" onSubmit={this._onSubmit}>
                    {this.renderFilterControls()}
                    <div className="form-group form-group-sm">
                        <div className="col-sm-3"></div>
                        <div className="col-sm-6">
                            <button type="submit" onClick={this._onSubmit} className="btn btn-sm btn-primary"><i className="fa fa-search"></i> Search Virtual Machines</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>;
    },
    _onSubmit: function(e) {
        e.preventDefault();
        this.props.handleSearch(this.state.values);
    }

});

module.exports = FilterForm;
