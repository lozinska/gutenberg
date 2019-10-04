/**
 * External dependencies
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { uniqueId } from 'lodash';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ResponsiveBlockControl from '../index';

let container = null;
beforeEach( () => {
	// setup a DOM element as a render target
	container = document.createElement( 'div' );
	document.body.appendChild( container );
} );

afterEach( () => {
	// cleanup on exiting
	unmountComponentAtNode( container );
	container.remove();
	container = null;
} );

const inputId = uniqueId();

const renderTestDefaultControlComponent = ( label ) => {
	return (
		<Fragment>
			<label htmlFor={ inputId }>{ label }</label>
			<input
				id={ inputId }
				defaultValue={ label }
			/>
		</Fragment>
	);
};

describe( 'Basic rendering', () => {
	it( 'should render with required props', () => {
		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					property="padding"
					renderDefaultControl={ renderTestDefaultControlComponent }
				/>, container
			);
		} );

		const activePropertyLabel = Array.from( container.querySelectorAll( 'legend' ) ).filter( ( legend ) => legend.innerHTML === 'Padding' );

		const activeDeviceLabel = Array.from( container.querySelectorAll( 'label' ) ).filter( ( label ) => label.innerHTML.includes( 'All' ) );

		const defaultControl = container.querySelector( 'input[value="All"]' );

		const toggleLabel = Array.from( container.querySelectorAll( 'label' ) ).filter( ( label ) => label.innerHTML.includes( 'Use the same padding on all screensizes' ) );

		const toggleState = container.querySelector( 'input[type="checkbox"]' ).checked;

		const defaultControlGroupHidden = container.querySelector( '.block-editor-responsive-block-control__group--default' ).hidden;

		const responsiveControlGroupHidden = container.querySelector( '.block-editor-responsive-block-control__group--responsive' ).hidden;

		expect( container.innerHTML ).not.toBe( '' );

		expect( defaultControlGroupHidden ).toBe( false );
		expect( responsiveControlGroupHidden ).toBe( true );

		expect( activeDeviceLabel ).toHaveLength( 1 );
		expect( activePropertyLabel ).toHaveLength( 1 );
		expect( defaultControl ).not.toBeNull();
		expect( toggleLabel ).not.toBeNull();
		expect( toggleState ).toBe( true );
		expect( container.innerHTML ).toMatchSnapshot();
	} );

	it( 'should not render without valid legend', () => {
		act( () => {
			render(
				<ResponsiveBlockControl
					property="padding"
					renderDefaultControl={ renderTestDefaultControlComponent }
				/>, container
			);
		} );

		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'should not render without valid property', () => {
		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					renderDefaultControl={ ( label ) => (

						<Fragment>
							<label htmlFor={ inputId }>{ label }</label>
							<input
								id={ inputId }
								defaultValue={ label }
							/>
						</Fragment>
					) }
				/>, container
			);
		} );

		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'should not render without valid default control render prop', () => {
		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					property="padding"
				/>, container
			);
		} );

		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'should render with custom label for toggle control when provided', () => {
		const customToggleLabel = 'Utilise a matching padding value on all viewports';
		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					property="padding"
					renderDefaultControl={ renderTestDefaultControlComponent }
					toggleLabel={ customToggleLabel }
				/>, container
			);
		} );

		const actualToggleLabel = container.querySelector( 'label.components-toggle-control__label' ).innerHTML;

		expect( actualToggleLabel ).toEqual( customToggleLabel );
	} );

	it( 'should pass custom label for default control group to the renderDefaultControl function when provided', () => {
		const customDefaultControlGroupLabel = 'Everything';

		const spyRenderDefaultControl = jest.fn();

		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					property="padding"
					renderDefaultControl={ spyRenderDefaultControl }
					defaultLabel={ customDefaultControlGroupLabel }
				/>, container
			);
		} );

		expect( spyRenderDefaultControl ).toHaveBeenCalledWith( customDefaultControlGroupLabel );
	} );
} );

describe( 'Default and Responsive modes', () => {
	it( 'should render in responsive mode when responsiveControlsActive prop is set to true', () => {
		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					property="padding"
					responsiveControlsActive={ true }
					renderDefaultControl={ renderTestDefaultControlComponent }
				/>, container
			);
		} );

		const defaultControlGroup = container.querySelector( '.block-editor-responsive-block-control__group--default' );
		const responsiveControlGroup = container.querySelector( '.block-editor-responsive-block-control__group--responsive' );

		expect( defaultControlGroup.hidden ).toBe( true );
		expect( responsiveControlGroup.hidden ).toBe( false );
	} );

	it( 'should render a set of custom devices in responsive mode when provided', () => {
		const customDeviceSet = [ 'Tiny', 'Small', 'Medium', 'Huge' ];

		const mockRenderDefaultControl = jest.fn( renderTestDefaultControlComponent );

		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					property="padding"
					responsiveControlsActive={ true }
					renderDefaultControl={ mockRenderDefaultControl }
					devices={ customDeviceSet }
				/>, container
			);
		} );

		const defaultRenderControlCall = 1;

		// Get array of labels which match those in the custom devices provided
		const responsiveDevicesLabels = Array.from( container.querySelectorAll( 'label' ) ).filter( ( label ) => {
			const labelText = label.innerHTML;
			// Is the label one of those in the custom device set?
			return customDeviceSet.includes( labelText );
		} );

		expect( responsiveDevicesLabels ).toHaveLength( customDeviceSet.length );
		expect( mockRenderDefaultControl ).toHaveBeenCalledTimes( customDeviceSet.length + defaultRenderControlCall );
	} );

	it( 'should switch between default and responsive modes when interacting with toggle control', () => {
		act( () => {
			render(
				<ResponsiveBlockControl
					legend="Padding"
					property="padding"
					renderDefaultControl={ renderTestDefaultControlComponent }
				/>, container
			);
		} );

		const defaultControlGroup = container.querySelector( '.block-editor-responsive-block-control__group--default' );
		const responsiveControlGroup = container.querySelector( '.block-editor-responsive-block-control__group--responsive' );

		// Select elements based on what the user can see
		const toggleLabel = Array.from( container.querySelectorAll( 'label' ) ).find( ( label ) => label.innerHTML.includes( 'Use the same padding on all screensizes' ) );
		const toggleInput = container.querySelector( `#${ toggleLabel.getAttribute( 'for' ) }` );

		// Initial mode (default)
		expect( defaultControlGroup.hidden ).toBe( false );
		expect( responsiveControlGroup.hidden ).toBe( true );

		// Toggle to "responsive" mode
		act( () => {
			Simulate.change( toggleInput, { target: { checked: false } } );
		} );

		expect( defaultControlGroup.hidden ).toBe( true );
		expect( responsiveControlGroup.hidden ).toBe( false );

		// Toggle back to "default" mode
		act( () => {
			Simulate.change( toggleInput, { target: { checked: true } } );
		} );

		expect( defaultControlGroup.hidden ).toBe( false );
		expect( responsiveControlGroup.hidden ).toBe( true );
	} );
} );
