const bindAll = require('lodash.bindall');
const classNames = require('classnames');
const React = require('react');
const MediaQuery = require('react-responsive').default;
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;

const render = require('../../../lib/render.jsx');
const frameless = require('../../../lib/frameless');

const Avatar = require('../../../components/avatar/avatar.jsx');
const Page = require('../../../components/page/www/page.jsx');
const Button = require('../../../components/forms/button.jsx');
const FlexRow = require('../../../components/flex-row/flex-row.jsx');
const Comment = require('../../../components/comment/comment.jsx');
// const CountryBlurb = require('./country-blurb/country-blurb.jsx');
const TextAndMediaSnippet = require('../../../components/text-and-media-snippet/text-and-media-snippet.jsx');
const TimelineCard = require('../../../components/timeline-card/timeline-card.jsx');
const PeopleGrid = require('../../../components/people-grid/people-grid.jsx');
const People = require('./people.json');
const VideoPreview = require('../../../components/video-preview/video-preview.jsx');
const Supporters = require('./supporters.json');
import {TwitterTweetEmbed} from 'react-twitter-embed';
// const Organizations = require('./orgs.json');


require('./annual-report.scss');

// Director’s Message / Mission / Reach / Themes / Founder's Message / Supporters / Team / Donate

// Some constants used for the page subnav and section refs
const SECTIONS = {
    founders_message: 'founders_message',
    mission: 'mission',
    reach: 'reach',
    themes: 'themes',
    directors_message: 'directors_message',
    supporters: 'supporters',
    team: 'team',
    donate: 'donate'
};

const SECTION_NAMES = {
    directors_message: <FormattedMessage id="annualReport.2021.subnavDirectorsMessage" />,
    mission: <FormattedMessage id="annualReport.2021.subnavMission" />,
    reach: <FormattedMessage id="annualReport.2021.subnavReach" />,
    themes: <FormattedMessage id="annualReport.2021.subnavThemes" />,
    founders_message: <FormattedMessage id="annualReport.2021.subnavFoundersMessage" />,
    supporters: <FormattedMessage id="annualReport.2021.subnavSupporters" />,
    team: <FormattedMessage id="annualReport.2021.subnavTeam" />,
    donate: <FormattedMessage id="annualReport.2021.subnavDonate" />
};

const COUNTRIES = [
    'Uganda',
    'India',
    'USA',
    'Brazil',
    'Australia',
    'South Africa',
    'UK',
    'Mexico',
    'Spain',
    'Kenya',
    'Cambodia',
    'Nigeria',
    'Canada'
];

const CreateOrgList = () => (
    <div>
        {/* eslint-disable */}
        {COUNTRIES.map((country, i) => {
            return <h4 key={i}>{country}</h4>;
        })}
    </div>
);

// Create the div given a list of supporter names,
// this will contain two columns of names either of equal size
// or with the left column containing 1 more item than the right
const createSupportersLists = (inKind, supportersList) => {
    supportersList.sort();
    const splitIndex = Math.ceil(supportersList.length / 2);
    const firstHalf = supportersList.slice(0, splitIndex);
    const secondHalf = supportersList.slice(splitIndex);
    
    return (
        <div className="supporters-list">
            <ul className="supporters-list-side">
                {
                    firstHalf.map((supporter, index) => (
                        <li key={index}>
                            {supporter}
                            {inKind.includes(supporter) &&
                                <span className="in-kind" />
                            }
                        </li>
                    ))
                }
            </ul>
            <ul className="supporters-list-side">
                {
                    secondHalf.map((supporter, index) => (
                        <li key={index}>
                            {supporter}
                            {inKind.includes(supporter) &&
                                <span className="in-kind" />
                            }
                        </li>
                    ))
                }
            </ul>
        </div>
    );
};

class AnnualReport extends React.Component {
    constructor (props) {
        super(props);

        // Storage for each of the section refs when we need to refer
        // to them in the scroll handling code
        // These will be stored with a short lowercase key representing
        // the specific section (e.g. 'mission')
        this.sectionRefs = {};

        this.subnavRef = null;

        this.state = {
            currentlyVisible: SECTIONS.directors_message, // The currently visible section
            dropdownVisible: false
        };

        bindAll(this, [
            'scrollTo',
            'setRef',
            'setSubnavRef',
            'handleSubnavItemClick',
            'getDimensionsOfSection',
            'handleScroll',
            'handleDropDownClick'
        ]);
    }

    componentDidMount () {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnMount () {
        window.removeEventListener('scroll', this.handleScroll);
    }

    // A generic handler for a subnav item that takes the name of the
    // section to scroll to (all lowercase)
    handleSubnavItemClick (sectionName) {
        // Return a button click handler that will close the dropdown if open
        // and scrolls to the correct section
        return () => {
            this.setState({dropdownVisible: false});
            this.scrollTo(this.sectionRefs[sectionName]);
        };
    }

    scrollTo (element) {
        if (element) {
            const sectionTop = this.getDimensionsOfSection(element).offsetTop;
            window.scrollTo({top: sectionTop, behavior: 'smooth'});
            // The smooth scrolling doesn't work on Safari
            // but this code allows scrolling to the correct part of the section
            // in Safari since the css property 'scrollMarginTop' is also not supported there
        }
    }

    // Generically create a ref for the given section, stored in
    // this.sectionRefs
    setRef (sectionName) {
        return ref => (this.sectionRefs[sectionName] = ref);
    }

    setSubnavRef (ref) {
        this.subnavRef = ref;
    }

    // Calculate the dimensions of a given section for use in figuring out
    // which section is currently visible
    getDimensionsOfSection (sectionRef) {
        const {height} = sectionRef.getBoundingClientRect();
        const offsetTop = sectionRef.offsetTop;
        const offsetBottom = offsetTop + height;

        return {
            height,
            offsetTop,
            offsetBottom
        };
    }

    // While scrolling, update the subnav to reflect the currently visible section
    handleScroll () {
        const subnavHeight = this.getDimensionsOfSection(this.subnavRef).height;
        // The additional 50 is to account for the main site nav height
        const currentScrollPosition = window.scrollY + subnavHeight + 50;

        // Find which section is currently visible based on our scroll position
        for (const key in this.sectionRefs) {
            if (!this.sectionRefs.hasOwnProperty(key)) continue;
            const currentRef = this.sectionRefs[key];
            const {offsetBottom, offsetTop} = this.getDimensionsOfSection(currentRef);
            if (currentScrollPosition > offsetTop && currentScrollPosition < offsetBottom) {
                if (this.state.currentlyVisible !== key) {
                    this.setState({currentlyVisible: key});
                    return;
                }
            }
        }
    }

    // Click handler for responsive subnav dropdown
    handleDropDownClick () {
        this.setState({dropdownVisible: !this.state.dropdownVisible});
    }

    render () {
        // Element containing buttons to scroll to each of the sections in the
        // annual report. The layout of this component will be different on
        // different screen sizes (see below)
        const subnav =
            (<FlexRow className="inner">
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.directors_message}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.directors_message)}
                >
                    <FormattedMessage id="annualReport.2021.subnavDirectorsMessage" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.mission}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.mission)}
                >
                    <FormattedMessage id="annualReport.2021.subnavMission" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.reach}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.reach)}
                >
                    <FormattedMessage id="annualReport.2021.subnavReach" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.themes}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.themes)}
                >
                    <FormattedMessage id="annualReport.2021.subnavThemes" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.founders_message}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.founders_message)}
                >
                    <FormattedMessage id="annualReport.2021.subnavFoundersMessage" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.supporters}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.supporters)}
                >
                    <FormattedMessage id="annualReport.2021.subnavSupporters" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.team}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.team)}
                >
                    <FormattedMessage id="annualReport.2021.subnavTeam" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.donate}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.donate)}
                >
                    <FormattedMessage id="annualReport.2021.subnavDonate" />
                </a>
            </FlexRow>);

        return (
            <div>
                <div
                    className="subnavigation"
                    ref={this.setSubnavRef}
                >
                    {/* Top Bar */}
                    <MediaQuery maxWidth={frameless.tabletPortrait - 1}>
                        <div className="sectionIndicator inner" >
                            {SECTION_NAMES[this.state.currentlyVisible]}
                            <Button
                                className="dropdown-button"
                                onClick={this.handleDropDownClick}
                            >
                                <img
                                    className={classNames({rotated: this.state.dropdownVisible})}
                                    src="/images/annual-report/dropdown-arrow.svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altDropdownArrow'})}
                                />
                            </Button>
                        </div>
                        {this.state.dropdownVisible ?
                            /* Bottom Bar */
                            <div className="inner">
                                <hr />
                                {subnav}
                            </div> :
                            null
                        }
                    </MediaQuery>
                    {/* For large screens, show whole subnav, with no dropdown */}
                    <MediaQuery minWidth={frameless.tabletPortrait}>
                        {subnav}
                    </MediaQuery>
                </div>
                <div className="annual-report-content">
                    <div
                        className="message-section"
                        ref={this.setRef(SECTIONS.directors_message)}
                    >
                        <div className="inner">
                            <FlexRow className="masthead">
                                <div className="masthead-content">
                                    <p className="message-year">
                                        <FormattedMessage id="annualReport.2021.mastheadYear" />
                                    </p>
                                    <h1>
                                        <FormattedMessage id="annualReport.2021.mastheadTitle" />
                                    </h1>
                                </div>
                                {/* <img
                                    src="/images/annual-report/2021/Masthead Illustration.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altMastheadIllustration'}
                                    )}
                                /> */}
                                <img
                                    src="/images/annual-report/2021/Masthead_Illo_screenshot.png"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altMastheadIllustration'}
                                    )}
                                />
                            </FlexRow>
                            <MediaQuery minWidth={frameless.desktop}>
                                <img
                                    className="wave-icon-desktop"
                                    src="/images/annual-report/2021/Wave Icon.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altWave'}
                                    )}
                                />
                            </MediaQuery>
                            <FlexRow className="message-content">
                                <MediaQuery maxWidth={frameless.desktop - 1}>
                                    {/* Show the wave icon inside this div in smaller screens */}
                                    <div className="wave-icon-and-title">
                                        <img
                                            src="/images/annual-report/2021/Wave Icon.svg"
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altWave'}
                                            )}
                                        />
                                        <h2>
                                            <FormattedMessage id="annualReport.2021.directorsMessageTitle" />
                                        </h2>
                                    </div>
                                </MediaQuery>
                                <MediaQuery minWidth={frameless.desktop}>
                                    <h2>
                                        <FormattedMessage id="annualReport.2021.directorsMessageTitle" />
                                    </h2>
                                </MediaQuery>
                                <div className="message-from-team directors-message">
                                    <p>
                                        <FormattedMessage id="annualReport.2021.directorsMessageP1" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.directorsMessageP2" />
                                    </p>
                                    <p className="pull-quote">
                                        <FormattedMessage id="annualReport.2021.directorsMessagePullquote" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.directorsMessageP3" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.directorsMessageP4" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.directorsMessageP5" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.directorsMessageP6" />
                                    </p>
                                    <div className="directors-signature">
                                        <img
                                            className="shawna-photo"
                                            src="/images/annual-report/2020/shawna_headshot.jpg"
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altAvatar'}
                                            )}
                                        />
                                        <div className="signature-container">
                                            <p className="message-signature">Shawna Young</p>
                                            <p>
                                                <FormattedMessage id="annualReport.2021.EDTitle" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </FlexRow>
                        </div>
                    </div>
                    <div
                        className="mission-section"
                        ref={this.setRef(SECTIONS.mission)}
                    >
                        <div className="inner">
                            <h4><FormattedMessage id="annualReport.2021.missionTitle" /></h4>
                            <p><FormattedMessage id="annualReport.2021.missionP1" /></p>
                            <p><FormattedMessage id="annualReport.2021.missionP2" /></p>
                            <h5><FormattedMessage id="annualReport.2021.visionHeader" /></h5>
                            <p>
                                <FormattedMessage id="annualReport.2021.visionSubtitle" />
                            </p>
                            <h5><FormattedMessage id="annualReport.2021.missionHeader" /></h5>
                            <p>
                                <FormattedMessage id="annualReport.2021.missionSubtitle" />
                            </p>
                            <h5><FormattedMessage id="annualReport.2021.valuesHeader" /></h5>
                            <p>
                                <FormattedMessage id="annualReport.2021.valuesSubtitle" />
                            </p>
                        </div>
                        <div className="four-up">
                            <div className="one-p four-up-creative-expression">
                                <div className="four-up-title creative-expression">
                                    <h3>
                                        <FormattedMessage id="annualReport.2021.creativeExpressionTitle" />
                                    </h3>
                                </div>
                                <p><FormattedMessage id="annualReport.2021.creativeExpressionDescription" /></p>
                            </div>
                            <div className="one-p equitable-opportunities">
                                <div className="four-up-title equitable-opportunities">
                                    <h3><FormattedMessage id="annualReport.2021.EquitableOpportunitiesTitle" /></h3>
                                </div>
                                <p><FormattedMessage id="annualReport.2021.EquitableOpportunitiesDescription" /></p>
                            </div>
                            <div className="one-p progressive-improvement">
                                <div className="four-up-title progressive-improvement">
                                    <h3><FormattedMessage id="annualReport.2021.progressiveImprovementTitle" /></h3>
                                </div>
                                <p><FormattedMessage id="annualReport.2021.progressiveImprovementDescription" /></p>
                            </div>
                            <div className="one-p playful-engagement">
                                <div className="four-up-title playful-engagement">
                                    <h3><FormattedMessage id="annualReport.2021.playfulEngagementTitle" /></h3>
                                </div>
                                <p><FormattedMessage id="annualReport.2021.playfulEngagementDescription" /></p>
                            </div>
                        </div>
                    </div>
                    <div
                        className="reach-section"
                        ref={this.setRef(SECTIONS.reach)}
                    >
                        <div className="inner">
                            <div className="reach-intro">
                                <div className="hed">
                                    <h2>
                                        <FormattedMessage id="annualReport.2021.reachTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.reachSubtitle" />
                                    </p>
                                </div>
                                <img
                                    src="/images/annual-report/2021/0_Data Section/Calendar.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altCalendar'}
                                    )}
                                />
                                <div className="reach-numbers">
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.2021.reachProjectCreatorsNumber"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.2021.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.2021.reachProjectCreators" />
                                        </h4>
                                        <div className="increase bubble">
                                            <FormattedMessage id="annualReport.2021.reachProjectCreatorsIncrease" />
                                        </div>
                                    </div>
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.2021.reachProjectsCreatedNumber"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.2021.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.2021.reachProjectsCreated" />
                                        </h4>
                                        <div className="increase bubble">
                                            <FormattedMessage id="annualReport.2021.reachProjectsCreatedIncrease" />
                                        </div>
                                    </div>
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.2021.reachNewUsersNumber"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.2021.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.2021.reachNewUsers" />
                                        </h4>
                                        <div className="increase bubble">
                                            <FormattedMessage id="annualReport.2021.reachNewUsersIncrease" />
                                        </div>
                                    </div>

                                    <div className="datapoint world">
                                        <img
                                            className="world"
                                            src="/images/annual-report/2021/0_Data Section/World.svg"
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altWorldVisualization'}
                                            )}
                                        />
                                        <p>
                                            <FormattedMessage
                                                id="annualReport.2021.reachScratchAroundTheWorld"
                                            />
                                        </p>
                                    </div>
                                    <div className="datapoint saudi-arabia">
                                        <div className="text-content">
                                            <h4>
                                                <FormattedMessage
                                                    id="annualReport.2021.reachSaudiArabiaTitle"
                                                />
                                            </h4>
                                            <p>
                                                <FormattedMessage
                                                    id="annualReport.2021.reachSaudiArabiaDescription"
                                                />
                                            </p>
                                        </div>
                                        <img
                                            className="world"
                                            src="/images/annual-report/2021/0_Data Section/Saudi Arabia.svg"
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altSaudiArabiaVisualization'}
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="reach-section t"
                    >
                        <div className="translation">
                            <div className="inner">
                                <div className="reach-translation">
                                    <div className="reach-translation-intro">
                                        <h3>
                                            <FormattedMessage id="annualReport.2021.reachTranslationTitle" />
                                        </h3>
                                        <div className="inline">
                                            <img
                                                src="/images/annual-report/2020/Symbols-UI/Arrow_up.svg"
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altArrowUp'}
                                                )}
                                            />
                                            <span className="bold">
                                                <FormattedMessage
                                                    id="annualReport.2021.reachTranslationIncrease"
                                                />
                                            </span>
                                        </div>
                                        <p>
                                            <FormattedMessage id="annualReport.2021.reachTranslationBlurb" />
                                        </p>
                                    </div>
                                    <img
                                        src="/images/annual-report/2020/data/translated-illustration.svg"
                                        alt={this.props.intl.formatMessage(
                                            {id: 'annualReport.2021.altTranslated'}
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <MediaQuery minWidth={frameless.mobile}>
                            <div className="scratch-jr-transition-img">
                                <img
                                    src="/images/annual-report/reach/horizontal-command.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altScratchHorizontalCommand'}
                                    )}
                                />
                            </div>
                        </MediaQuery>
                    </div>
                    <div className="reach-scratch-jr">
                        <div className="inner">
                            <div className="scratch-jr-intro">
                                <img
                                    src="/images/annual-report/2020/data/ScratchJr_Logo.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altScratchJr'}
                                    )}
                                />
                                <p>
                                    <FormattedMessage id="annualReport.2021.reachScratchJrBlurb" />
                                </p>
                            </div>
                            <div className="reach-datapoint">
                                <FormattedMessage
                                    id="annualReport.2021.reachDownloadsMillion"
                                    values={{
                                        million: (
                                            <div className="million">
                                                <FormattedMessage id="annualReport.2021.reachMillion" />
                                            </div>
                                        )
                                    }}
                                />
                                <h4>
                                    <FormattedMessage id="annualReport.2021.reachDownloads" />
                                </h4>
                                <div className="increase bubble dark">
                                    <FormattedMessage
                                        id="annualReport.2021.reachDownloadsIncrease"
                                        values={{
                                            million: (
                                                <div className="million">
                                                    <FormattedMessage id="annualReport.2021.reachMillion" />
                                                </div>
                                            )
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <MediaQuery minWidth={frameless.mobile}>
                            <div className="scratch-jr-transition-img">
                                <img
                                    src="/images/annual-report/reach/horizontal-loop.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altHorizontalLoop'}
                                    )}
                                />
                            </div>
                        </MediaQuery>
                    </div>
                    <div
                        className="initiatives-section"
                        ref={this.setRef(SECTIONS.themes)}
                    >
                        <div className="initiatives-intro">
                            <div className="inner">
                                <h2>
                                    <FormattedMessage id="annualReport.2021.themesTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.2021.themesDescription" />
                                </p>
                                <div className="initiatives-pillars">
                                    <div className="three-pillars">
                                        <div className="pillar-splash">
                                            <h4>
                                                <FormattedMessage id="annualReport.2021.SECTitle" />
                                            </h4>
                                        </div>
                                        <div className="pillar-splash">
                                            <h4>
                                                <FormattedMessage id="annualReport.2021.accessTitle" />
                                            </h4>
                                        </div>
                                        <div className="pillar-splash">
                                            <h4>
                                                <FormattedMessage id="annualReport.2021.communityTitle" />
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="initiatives-SEC">
                            <div className="initiatives-subsection-header SEC">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.2021.SECTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.SECIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="initiatives-subsection-content SEC">
                                {/* eslint-disable max-len */}
                                {/* <div className="inner"> */}
                                <div className="content two-up">
                                    <div className="p-content">
                                        <h4>
                                            <FormattedMessage id="annualReport.2021.SECWhatIs" />
                                        </h4>
                                        <p><FormattedMessage id="annualReport.2021.SECWhatIsP1" /></p>
                                        <p><FormattedMessage id="annualReport.2021.SECWhatIsP2" /></p>
                                        <p><FormattedMessage id="annualReport.2021.SECWhatIsP3" /></p>
                                    </div>
                                    <div className="stats">
                                        <div className="stat-block">
                                            <div className="stat-num">
                                                <FormattedMessage id="annualReport.2021.SECOrgNumber" />
                                            </div>
                                            <div className="stat-label">
                                                <FormattedMessage id="annualReport.2021.SECOrgLabel" />
                                            </div>
                                        </div>
                                        <div className="stat-block">
                                            <div className="stat-num">
                                                <FormattedMessage id="annualReport.2021.SECCountryNumber" />
                                            </div>
                                            <div className="stat-label">
                                                <FormattedMessage id="annualReport.2021.SECCountryLabel" />
                                            </div>
                                        </div>
                                        <div className="stat-block">
                                            <div className="stat-num">
                                                <FormattedMessage id="annualReport.2021.SECPartnerNumber" />
                                            </div>
                                            <div className="stat-label">
                                                <FormattedMessage id="annualReport.2021.SECPartnerLabel" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="map">
                                    <p><FormattedMessage id="annualReport.2021.SECMapParagraph" /></p>
                                    <img
                                        src="/images/annual-report/2021/1_SEC Section/Map.svg"
                                        alt={this.props.intl.formatMessage(
                                            {id: 'annualReport.2021.altMap'}
                                        )}
                                    />
                                    <CreateOrgList />
                                </div>
                                <div className="inner">
                                    <div className="spotlight bubble SEC">
                                        <FormattedMessage id="annualReport.2021.spotlightStory" />
                                    </div>
                                    <div className="content flex-content">
                                        <div className="text">
                                            <h4>
                                                <FormattedMessage id="annualReport.2021.SECSpotlightTitle" />
                                            </h4>
                                            <p className="larger">
                                                <FormattedMessage id="annualReport.2021.SECSpotlightLocation" />
                                            </p>
                                            <p>
                                                <FormattedMessage id="annualReport.2021.SECSpotlightText1" />
                                            </p>
                                            <p>
                                                <FormattedMessage id="annualReport.2021.SECSpotlightText2" />
                                            </p>
                                        </div>
                                        <div className="images">
                                            <img
                                                src="/images/annual-report/2021/1_SEC Section/Bridges to Science.svg"
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altSECSpotlightImage'}
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="content">
                                        <p className="pull-quote blue">
                                            <FormattedMessage id="annualReport.2021.SECPullQuote" />
                                        </p>
                                        <p className="pull-quote-attr">
                                            <FormattedMessage id="annualReport.2021.SECPullQuoteAttr" />
                                        </p>
                                    </div>
                                </div>
                                <div className="inner">
                                    <div className="workshop">
                                        <h4>
                                            <FormattedMessage id="annualReport.2021.SECWorkshops" />
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.2021.SECWorkshopsText" />
                                        </p>
                                        <h4 className="center">
                                            <FormattedMessage id="annualReport.2021.SECWorkshopsSubtitle" />
                                        </h4>
                                        <p>placeholder</p>
                                    </div>
                                </div>
                                {/* </div> */}
                                {/* <div className="inner">
                                    <div className="flex-content">
                                        <CountryBlurb
                                            icon="/images/annual-report/2021/SEC/Scratch Around the World/Scratch Al Sur logo.png"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.SECCountryChileTitle'}
                                            )}
                                            listIcon="/images/annual-report/2021/Symbols-UI/Location_icon.svg"
                                            country={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.SECCountryChile'}
                                            )}
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altChile'}
                                            )}
                                            iconAlt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altChileIcon'}
                                            )}
                                            largeImage="/images/annual-report/2021/SEC/Scratch Around the World/Scratch Al Sur graphic.svg"
                                        >
                                            <FormattedMessage
                                                id="annualReport.2021.SECCountryChileParagraph"
                                            />
                                        </CountryBlurb>
                                    </div>
                                    
                                    <div className="flex-content">
                                        <TextAndMediaSnippet
                                            className="regular top"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.SECExample1Title'}
                                            )}
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altTutorial'}
                                            )}
                                            type="image"
                                            largeImage="/images/annual-report/2021/SEC/TutorialUI.svg"
                                        >
                                            <FormattedMessage
                                                id="annualReport.2021.SECExample1Paragraph"
                                            />
                                        </TextAndMediaSnippet>
                                        <MediaQuery minWidth={frameless.desktop}>
                                            <TextAndMediaSnippet
                                                className="reverse"
                                                title={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.SECExample2Title'}
                                                )}
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altGettingStarted'}
                                                )}
                                                type="video"
                                                videoId="xfh9bvbeik"
                                                largeImage="/images/annual-report/2021/SEC/Getting Started with Scratch video.png"
                                                spinnerColor="blue"
                                            >
                                                <FormattedMessage
                                                    id="annualReport.2021.SECExample2Paragraph"
                                                />
                                            </TextAndMediaSnippet>
                                        </MediaQuery>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        
                        <div className="initiatives-access">
                            <div className="initiatives-subsection-header access">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.2021.accessTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.accessIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="world access">
                                <div className="spotlight bubble access">
                                    <FormattedMessage id="annualReport.2021.spotlightStory" />
                                </div>
                                <h4>
                                    <FormattedMessage id="annualReport.2021.accessASL" />
                                </h4>
                                <p>
                                    <FormattedMessage
                                        id="annualReport.2021.accessASLText"
                                    />
                                </p>
                                {/* eslint-disable max-len */}
                                <img
                                    src="/images/annual-report/2021/2_Access Section/Access Spotlight Story Illustration.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altAccessibility'}
                                    )}
                                />
                                <p>
                                    <FormattedMessage
                                        id="annualReport.2021.accessASLText2"
                                    />
                                </p>
                                <div className="content">
                                    <p className="pull-quote green left">
                                        <FormattedMessage id="annualReport.2021.accessPullQuote" />
                                    </p>
                                    <p className="pull-quote-attr right">
                                        <FormattedMessage id="annualReport.2021.accessPullQuoteAttr" />
                                    </p>
                                </div>
                                <p>
                                    <FormattedMessage
                                        id="annualReport.2021.accessASLText3"
                                    />
                                </p>
                                <div className="video-container SEC">
                                    <div className="video-background SEC">
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.2021.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2021/2_Access Section/Deaf Kids Code Video.png"
                                                videoId="i2g46ikddf"
                                                thumbnailWidth="580"
                                                videoHeight={580 * .568}
                                                videoWidth="580"
                                                alt={
                                                    this.props.intl.formatMessage(
                                                        {id: 'annualReport.2021.altSECVideoPreview'}
                                                    )
                                                }
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.2021.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2021/2_Access Section/Deaf Kids Code Video.png"
                                                videoId="i2g46ikddf"
                                                thumbnailWidth="400"
                                                videoHeight={400 * .568}
                                                videoWidth="400"
                                                alt={
                                                    this.props.intl.formatMessage(
                                                        {id: 'annualReport.2021.altSECVideoPreview'}
                                                    )
                                                }
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.2021.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2021/2_Access Section/Deaf Kids Code Video.png"
                                                videoId="i2g46ikddf"
                                                thumbnailWidth="300"
                                                videoHeight={300 * .568}
                                                videoWidth="300"
                                                alt={
                                                    this.props.intl.formatMessage(
                                                        {id: 'annualReport.2021.altSECVideoPreview'}
                                                    )
                                                }
                                            />
                                        </MediaQuery>
                                    </div>
                                </div>
                            </div>
                            {/* DEI Committees */}
                            <div className="inner">
                                <div className="flex-content">
                                    <MediaQuery minWidth={frameless.desktop}>
                                        {/* eslint-disable max-len */}
                                        <TextAndMediaSnippet
                                            className="regular"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.accessDEICommittee'}
                                            )}
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altaccessDEICommittee'}
                                            )}
                                            type="image"
                                            largeImage="/images/annual-report/2021/2_Access Section/Committees start illustration.svg"
                                        >
                                            <FormattedMessage
                                                id="annualReport.2021.accessDEICommitteeText"
                                            />
                                        </TextAndMediaSnippet>
                                    </MediaQuery>
                                    <MediaQuery maxWidth={frameless.desktop - 1}>
                                        {/* eslint-disable max-len */}
                                        <TextAndMediaSnippet
                                            className="regular"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.accessDEICommittee'}
                                            )}
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altaccessDEICommittee'}
                                            )}
                                            type="image"
                                            largeImage="/images/annual-report/2021/2_Access Section/Committees start illustration.svg"
                                        >
                                            <FormattedMessage
                                                id="annualReport.2021.accessDEICommitteeText"
                                            />
                                        </TextAndMediaSnippet>
                                    </MediaQuery>
                                </div>
                            </div>
                            {/* Accessibility */}
                            <div className="green">
                                <div className="inner">
                                    <div className="flex-content">
                                        <MediaQuery minWidth={frameless.desktop}>
                                            {/* eslint-disable max-len */}
                                            <TextAndMediaSnippet
                                                className="reverse"
                                                title={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.accessDEICommitteeAccessibility'}
                                                )}
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altaccessDEICommitteeAccessibility'}
                                                )}
                                                type="image"
                                                largeImage="/images/annual-report/2021/2_Access Section/Accessibility Committee Illustration.svg"
                                            >
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeAccessibilityText"
                                                />
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeAccessibilityText2"
                                                />
                                            </TextAndMediaSnippet>
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.desktop - 1}>
                                            {/* eslint-disable max-len */}
                                            <TextAndMediaSnippet
                                                className="regular"
                                                title={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.accessDEICommitteeAccessibility'}
                                                )}
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altaccessDEICommitteeAccessibility'}
                                                )}
                                                type="image"
                                                largeImage="/images/annual-report/2021/2_Access Section/Accessibility Committee Illustration.svg"
                                            >
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeAccessibilityText"
                                                />
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeAccessibilityText2"
                                                />
                                            </TextAndMediaSnippet>
                                        </MediaQuery>
                                    </div>
                                </div>
                            </div>
                            {/* G-JEDI */}
                            <div className="inner">
                                <div className="flex-content">
                                    <MediaQuery minWidth={frameless.desktop}>
                                        {/* eslint-disable max-len */}
                                        <TextAndMediaSnippet
                                            className="regular"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.accessDEICommitteeG-JEDI'}
                                            )}
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altaccessDEICommitteeG-JEDI'}
                                            )}
                                            type="image"
                                            largeImage="/images/annual-report/2021/2_Access Section/G-JEDI Committee Illustration.svg"
                                        >
                                            <FormattedMessage
                                                id="annualReport.2021.accessDEICommitteeG-JEDIText"
                                            />
                                            <FormattedMessage
                                                id="annualReport.2021.accessDEICommitteeG-JEDIText2"
                                            />
                                        </TextAndMediaSnippet>
                                    </MediaQuery>
                                    <MediaQuery maxWidth={frameless.desktop - 1}>
                                        {/* eslint-disable max-len */}
                                        <TextAndMediaSnippet
                                            className="regular"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.accessDEICommitteeG-JEDI'}
                                            )}
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altaccessDEICommitteeG-JEDI'}
                                            )}
                                            type="image"
                                            largeImage="/images/annual-report/2021/2_Access Section/G-JEDI Committee Illustration.svg"
                                        >
                                            <FormattedMessage
                                                id="annualReport.2021.accessDEICommitteeG-JEDIText"
                                            />
                                            <FormattedMessage
                                                id="annualReport.2021.accessDEICommitteeG-JEDIText2"
                                            />
                                        </TextAndMediaSnippet>
                                    </MediaQuery>
                                </div>
                            </div>
                            {/* Equity x Design */}
                            {/* link: https://design-justice.pubpub.org */}
                            <div className="green">
                                <div className="inner">
                                    <div className="flex-content">
                                        <MediaQuery minWidth={frameless.desktop}>
                                            {/* eslint-disable max-len */}
                                            <TextAndMediaSnippet
                                                className="reverse"
                                                title={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.accessDEICommitteeEquityXDesign'}
                                                )}
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altaccessDEICommitteeEquityXDesign'}
                                                )}
                                                type="image"
                                                largeImage="/images/annual-report/2021/2_Access Section/Equity x Design Committee Illustration.svg"
                                            >
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeEquityXDesignText"
                                                />
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeEquityXDesignText2"
                                                />
                                            </TextAndMediaSnippet>
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.desktop - 1}>
                                            {/* eslint-disable max-len */}
                                            <TextAndMediaSnippet
                                                className="regular"
                                                title={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.accessDEICommitteeEquityXDesign'}
                                                )}
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altaccessDEICommitteeEquityXDesign'}
                                                )}
                                                type="image"
                                                largeImage="/images/annual-report/2021/2_Access Section/Equity x Design Committee Illustration.svg"
                                            >
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeEquityXDesignText"
                                                />
                                                <FormattedMessage
                                                    id="annualReport.2021.accessDEICommitteeEquityXDesignText2"
                                                />
                                            </TextAndMediaSnippet>
                                        </MediaQuery>
                                    </div>
                                </div>
                            </div>
                            {/* 10 new languages */}
                            {/* eslint-disable max-len */}
                            <div className="inner">
                                <div className="flex-content">
                                    <div className="text-and-media-snippet regular">
                                        <div className="half">
                                            <div className="snapshot bubble access left-align">
                                                <FormattedMessage id="annualReport.2021.accessSnapshot" />
                                            </div>
                                            <h4>
                                                <FormattedMessage id="annualReport.2021.access10NewLanguages" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.2021.access10NewLanguagesText" />
                                            </p>
                                        </div>
                                        <div className="half">
                                            <MediaQuery
                                                minWidth={frameless.desktop}
                                            >
                                                <iframe
                                                    src="https://scratch.mit.edu/projects/430997530/embed"
                                                    allowTransparency="true"
                                                    width="360"
                                                    height={((360 * .76) + 45)}
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    allowFullScreen
                                                />
                                            </MediaQuery>
                                            <MediaQuery
                                                maxWidth={frameless.desktop - 1}
                                                minWidth={frameless.mobile}
                                            >
                                                <iframe
                                                    src="https://scratch.mit.edu/projects/430997530/embed"
                                                    allowTransparency="true"
                                                    width="430"
                                                    height={((430 * .76) + 45)}
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    allowFullScreen
                                                />
                                            </MediaQuery>
                                            <MediaQuery maxWidth={frameless.mobile - 1}>
                                                <iframe
                                                    src="https://scratch.mit.edu/projects/430997530/embed"
                                                    allowTransparency="true"
                                                    width="300"
                                                    height={((300 * .76) + 45)}
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    allowFullScreen
                                                />
                                            </MediaQuery>
                                        </div>
                                    </div>
                                </div>
                                {/* South Africa */}
                                <div className="inner">
                                    <div className="flex-content">
                                        <MediaQuery minWidth={frameless.desktop}>
                                            {/* eslint-disable max-len */}
                                            <TextAndMediaSnippet
                                                className="reverse"
                                                title={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.accessSouthAfrica'}
                                                )}
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altaccessSouthAfrica'}
                                                )}
                                                type="image"
                                                largeImage="/images/annual-report/2021/2_Access Section/zero-rated scratch illustration.svg"
                                            >
                                                <FormattedMessage
                                                    id="annualReport.2021.accessSouthAfricaText"
                                                />
                                            </TextAndMediaSnippet>
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.desktop - 1}>
                                            {/* eslint-disable max-len */}
                                            <TextAndMediaSnippet
                                                className="regular"
                                                title={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.accessSouthAfrica'}
                                                )}
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altaccessSouthAfrica'}
                                                )}
                                                type="image"
                                                largeImage="/images/annual-report/2021/2_Access Section/zero-rated scratch illustration.svg"
                                            >
                                                <FormattedMessage
                                                    id="annualReport.2021.accessSouthAfricaText"
                                                />
                                            </TextAndMediaSnippet>
                                        </MediaQuery>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="initiatives-community">
                            <div className="initiatives-subsection-header community">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.2021.communityTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.communityIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="initiatives-subsection-content">
                                <div className="world">
                                    <div className="snapshot bubble community">
                                        <FormattedMessage id="annualReport.2021.accessSnapshot" />
                                    </div>
                                    <h4>
                                        <FormattedMessage id="annualReport.2021.communityScratchConference" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.communityScratchConferenceText1" />
                                    </p>
                                </div>
                                <div className="tweet-container">
                                    <div className="tweets">
                                        <TwitterTweetEmbed
                                            tweetId={'1418269822270337026'}
                                        />
                                        <TwitterTweetEmbed
                                            tweetId={'1418262789764825089'}
                                        />
                                    </div>
                                </div>
                                {/* <div className="bg-image-container">
                                    <img
                                        src="/images/annual-report/2021/community/Creative Computing Sprinkles left.svg"
                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altSprinklesLeft'})}
                                    />
                                    <img
                                        src="/images/annual-report/2021/community/Creative Computing Sprinkles right.svg"
                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altSprinklesRight'})}
                                    />
                                </div> */}
                                
                            </div>

                            <div className="inner center">
                                <h2>
                                    <FormattedMessage id="annualReport.2021.communityScratchCommunity" />
                                </h2>
                            </div>
                            <div className="background-community-images">
                                <img
                                    src="/images/annual-report/2021/community/Online Community Illustration Wave.svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altWaveTop'})}
                                />
                                <img
                                    src="/images/annual-report/2021/community/Online Community Illustration.png"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altWaveBottom'})}
                                />
                            </div>
                            <div className="inner center">
                                <p>
                                    <FormattedMessage id="annualReport.2021.communityScratchCommunityIntro" />
                                </p>
                            </div>
                            <div className="inner">
                                <div className="community-quotes double">
                                    <div className="community-quote">
                                        <div className="quote-person">
                                            <Avatar
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altAvatar'}
                                                )}
                                                src="https://cdn2.scratch.mit.edu/get_image/user/36591_60x60.png"
                                            />
                                            <div>
                                                <h5>
                                                    angelical
                                                </h5>
                                            </div>
                                        </div>
                                        <Comment
                                            className="community"
                                            comment={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.communityQuoteGroupText1'}
                                            )}
                                        />
                                    </div>
                                    <div className="community-quote">
                                        <div className="quote-person">
                                            <Avatar
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altAvatar'}
                                                )}
                                                src="https://cdn2.scratch.mit.edu/get_image/user/61442584_60x60.png"
                                            />
                                            <div>
                                                <h5>
                                                    dlore2009
                                                </h5>
                                            </div>
                                        </div>
                                        <Comment
                                            className="community"
                                            comment={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.communityQuoteGroupText2'}
                                            )}
                                        />
                                    </div>
                                    <div className="community-quote">
                                        <div className="quote-person">
                                            <Avatar
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altAvatar'}
                                                )}
                                                src="/images/annual-report/2021/community/avatar_qood.jpg"
                                            />
                                            <div>
                                                <h5>
                                                    qood
                                                </h5>
                                            </div>
                                        </div>
                                        <Comment
                                            className="community"
                                            comment={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.communityQuoteGroupText3'}
                                            )}
                                        />
                                    </div>
                                    <div className="community-quote">
                                        <div className="quote-person">
                                            <Avatar
                                                alt={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.altAvatar'}
                                                )}
                                                src="https://cdn2.scratch.mit.edu/get_image/user/176301_60x60.png"
                                            />
                                            <div>
                                                <h5>
                                                    Mechanical_pencil
                                                </h5>
                                            </div>
                                        </div>
                                        <Comment
                                            className="community"
                                            comment={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.communityQuoteGroupText4'}
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* go into timeline section */}
                            <div className="year-in-review">
                                <img
                                    className="upper-wave"
                                    src="/images/annual-report/2021/community/Timeline/Wave (upper).svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altWaveBottom'})}
                                />
                                <div className="inner center yr">
                                    <h2>
                                        <FormattedMessage id="annualReport.2021.yearInReview" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.yearInReviewText" />
                                    </p>
                                </div>
                                <TimelineCard
                                    className="center"
                                    link="https://scratch.mit.edu/studios/25528144"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard1Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard1Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard1Text'}
                                    )}
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altJanuaryCard'}
                                    )}
                                    image="/images/annual-report/2021/community/Timeline/Images/endofthedecade_sds.jpg"
                                    projectBy={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.projectBy'}
                                    )}
                                    attribution="u/lukiepie2011"
                                />
                                <img
                                    className="connector left"
                                    src="/images/annual-report/2021/community/Timeline/lines/jan_apr_line.svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altConnectingLine'})}
                                />
                                <TimelineCard
                                    className="left"
                                    link="https://scratch.mit.edu/studios/26160799/"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard2Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard2Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard2Text'}
                                    )}
                                />
                                <TimelineCard
                                    className="left"
                                    link="https://www.youtube.com/watch?v=uR5C173yrJs"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard3Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard3Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard3Text'}
                                    )}
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altAprilCard'}
                                    )}
                                    image="/images/annual-report/2021/community/Timeline/Images/createalong.jpg"
                                />
                                <img
                                    className="connector"
                                    src="/images/annual-report/2021/community/Timeline/lines/apr_may_line.svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altConnectingLine'})}
                                />
                                <TimelineCard
                                    className="right"
                                    link="https://scratch.mit.edu/projects/400944766/"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard4Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard4Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard4Text'}
                                    )}
                                />
                                <TimelineCard
                                    className="right"
                                    link="https://scratch.wistia.com/medias/r1pmlyylye"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard5Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard5Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard5Text'}
                                    )}
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altMayCard'}
                                    )}
                                    image="/images/annual-report/2021/community/Timeline/Images/blmvideo.png"
                                    videoId="r1pmlyylye"
                                    spinnerColor="blue"
                                />
                                <img
                                    className="connector"
                                    src="/images/annual-report/2021/community/Timeline/lines/may_jun_line.svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altConnectingLine'})}
                                />
                                <TimelineCard
                                    className="left"
                                    link="https://scratch.mit.edu/studios/26498205"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard6Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard6Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard6Text'}
                                    )}
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altJuneCard'}
                                    )}
                                    image="/images/annual-report/2021/community/Timeline/Images/funathome_sds.jpg"
                                    projectBy={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.projectBy'}
                                    )}
                                    attribution="u/cellie"
                                />
                                <TimelineCard
                                    className="left"
                                    link="https://scratch.mit.edu/studios/26938704/"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard7Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard7Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard7Text'}
                                    )}
                                />
                                <img
                                    className="connector"
                                    src="/images/annual-report/2021/community/Timeline/lines/jun_jul_line.svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altConnectingLine'})}
                                />
                                <TimelineCard
                                    className="right"
                                    link="https://scratch.mit.edu/studios/27388950/"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard8Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard8Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard8Text'}
                                    )}
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altJulyCard'}
                                    )}
                                    image="/images/annual-report/2021/community/Timeline/Images/scratchcamp.jpg"
                                    projectBy={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.projectBy'}
                                    )}
                                    attribution="u/LGMammoth"
                                />
                                <img
                                    className="connector right"
                                    src="/images/annual-report/2021/community/Timeline/lines/jul_oct_line.svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altConnectingLine'})}
                                />
                                <TimelineCard
                                    className="center"
                                    link="https://scratch.mit.edu/studios/27737452"
                                    date={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard9Date'}
                                    )}
                                    title={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard9Title'}
                                    )}
                                    text={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.yearInReviewCard9Text'}
                                    )}
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altOctoberCard'}
                                    )}
                                    image="/images/annual-report/2021/community/Timeline/Images/scratchtober.jpg"
                                    projectBy={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.projectBy'}
                                    )}
                                    attribution="u/IDK_HAVE_SOME_NUMBER"
                                />
                                <div className="illustrations">
                                    <img
                                        className="april"
                                        src="/images/annual-report/2021/community/Timeline/April Illustration.svg"
                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altApril'})}
                                    />
                                    <img
                                        className="may"
                                        src="/images/annual-report/2021/community/Timeline/May Illustration.svg"
                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altMay'})}
                                    />
                                    <img
                                        className="june"
                                        src="/images/annual-report/2021/community/Timeline/June Illustration.svg"
                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altJune'})}
                                    />
                                    <img
                                        className="june-2"
                                        src="/images/annual-report/2021/community/Timeline/avatar_Bellevue91.png"
                                        alt={this.props.intl.formatMessage(
                                            {id: 'annualReport.2021.altAvatar'}
                                        )}
                                    />
                                    <img
                                        className="july"
                                        src="/images/annual-report/2021/community/Timeline/July Illustration.svg"
                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altJuly'})}
                                    />
                                </div>
                                <img
                                    className="lower-wave"
                                    src="/images/annual-report/2021/community/Timeline/Wave (lower).svg"
                                    alt={this.props.intl.formatMessage({id: 'annualReport.2021.altWaveBottom'})}
                                />
                            </div>
                            <div className="initiatives-subsection-content">
                                <div className="wide inner community">
                                    <div className="community-quotes">
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt={this.props.intl.formatMessage(
                                                        {id: 'annualReport.2021.altAvatar'}
                                                    )}
                                                    src="/images/annual-report/2021/community/quote_annalytical.svg"
                                                />
                                                <div>
                                                    <h5>
                                                        <FormattedMessage id="annualReport.2021.communityQuote2Name" />
                                                    </h5>
                                                    <p>
                                                        <FormattedMessage id="annualReport.2021.communityQuote2Title" />
                                                    </p>
                                                </div>
                                            </div>
                                            <Comment
                                                className="community"
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.2021.communityQuote2Text'}
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="content two-wide split">
                                        <div className="text">
                                            <div className="snapshot bubble community">
                                                <FormattedMessage id="annualReport.2021.accessSnapshot" />
                                            </div>
                                            <h4>
                                                <FormattedMessage id="annualReport.2021.communitySnapshotTitle" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.2021.communitySnapshotText" />
                                            </p>
                                        </div>
                                        <div className="images">
                                            <img
                                                src="/images/annual-report/2021/community/Tools Illustration.svg"
                                                alt={this.props.intl.formatMessage({id: 'annualReport.2021.altToolsIllustration'})}
                                            />
                                        </div>
                                    </div>
                                    <div className="world">
                                        <h4>
                                            <FormattedMessage id="annualReport.2021.communitySnapshot2Title" />
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.2021.communitySnapshot2Text" />
                                        </p>
                                    </div>
                                    <div className="community-sds">
                                        <div className="sds-list">
                                            <div className="sds-tile">
                                                <a
                                                    href="https://www.youtube.com/watch?v=eekrc3Xs9Z0"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src="/images/annual-report/2021/community/tutorials_virtualtown.jpg"
                                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altVirtualTown'})}
                                                    />
                                                    <FormattedMessage id="annualReport.2021.tutorial1" />
                                                </a>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="https://www.youtube.com/watch?v=7NN5v2wSL4U"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src="/images/annual-report/2021/community/tutorials_catchgame.jpg"
                                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altCatchGame'})}
                                                    />
                                                    <FormattedMessage id="annualReport.2021.tutorial2" />
                                                </a>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="https://www.youtube.com/watch?v=-3oCdNIeU_8"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src="/images/annual-report/2021/community/tutorials_characterdesigner.jpg"
                                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altCharacterDesigner'})}
                                                    />
                                                    <FormattedMessage id="annualReport.2021.tutorial3" />
                                                </a>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="https://www.youtube.com/watch?v=irhNLRWwhv0"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src="/images/annual-report/2021/community/tutorials_virtualpet.jpg"
                                                        alt={this.props.intl.formatMessage({id: 'annualReport.2021.altVirtualPet'})}
                                                    />
                                                    <FormattedMessage id="annualReport.2021.tutorial4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        {/* eslint-enable max-len */}
                        
                        
                    </div>
                    <div
                        className="directors-message"
                        ref={this.setRef(SECTIONS.directors_message)}
                    >
                        <div className="inner">
                            <div className="flex-content">
                                <div className="header">
                                    <h2>
                                        <FormattedMessage id="annualReport.2021.EDMessageTitle" />
                                    </h2>
                                </div>
                                <div className="text">
                                    <p>
                                        <FormattedMessage id="annualReport.2021.EDMessageText1" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.EDMessageText2" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.EDMessageText3" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.EDMessageText4" />
                                    </p>
                                    <p className="pull-quote">
                                        <FormattedMessage id="annualReport.2021.EDMessagePullQuote" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.EDMessageText5" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.EDMessageText6" />
                                    </p>
                                    <div className="signature">
                                        <Avatar
                                            alt={this.props.intl.formatMessage(
                                                {id: 'annualReport.2021.altAvatar'}
                                            )}
                                            src="/images/annual-report/2021/shawna_headshot.jpg"
                                        />
                                        <div>
                                            <h5>
                                                Shawna Young
                                            </h5>
                                            <p>
                                                <FormattedMessage id="annualReport.2021.EDTitle" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="looking-forward">
                        <h2>
                            <FormattedMessage id="annualReport.2021.lookingForward" />
                        </h2>
                        <p>
                            <FormattedMessage id="annualReport.2021.lookingForwardText1" />
                        </p>
                        <img
                            className="illo"
                            src="/images/annual-report/2021/Looking Forward Illustration.svg"
                            alt={this.props.intl.formatMessage({id: 'annualReport.2021.altLookingForward'})}
                        />
                        <p>
                            <FormattedMessage id="annualReport.2021.lookingForwardText2" />
                        </p>
                        <h5>
                            <FormattedMessage id="annualReport.2021.learnMore" />
                        </h5>
                        <ul>
                            <li>
                                <a
                                    href="https://www.legofoundation.com/en/about-us/news/the-lego-foundation-and-scratch-foundation-announce-partnership-to-support-learning-through-play-with-technology-for-millions-of-children-across-the-world/"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    <FormattedMessage id="annualReport.2021.learnMoreLink1Text" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://blog.google/outreach-initiatives/education/cs-ed-week-2021/"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    <FormattedMessage id="annualReport.2021.learnMoreLink2Text" />
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div
                        className="supporters-section"
                        ref={this.setRef(SECTIONS.supporters)}
                    >
                        <div className="inner">
                            <div className="supporters-heading">
                                <h2>
                                    <FormattedMessage id="annualReport.2021.supportersTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.2021.supportersIntro" />
                                </p>
                            </div>
                            <div className="supporters-subsection">
                                <div className="supporters-blurb">
                                    <h4>
                                        <FormattedMessage id="annualReport.2021.ourSupporters" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.2021.ourSupportersText" />
                                    </p>
                                </div>
                            </div>
                            <div className="supporters-subsection">
                                <div className="supporters-level">
                                    <h4>
                                        <FormattedMessage id="annualReport.2021.supportersFoundingTitle" />
                                    </h4>
                                    <hr />
                                    <p className="italics">
                                        <FormattedMessage id="annualReport.2021.supportersFoundingText" />
                                    </p>
                                    {createSupportersLists(Supporters.inKind, Supporters.founding)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.2021.supportersCatPartnersTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inKind, Supporters.catPartners)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.2021.supportersCreativityTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inKind, Supporters.creativity)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.2021.supportersCollaborationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inKind, Supporters.collaboration)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.2021.supportersImaginationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inKind, Supporters.imagination)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.2021.supportersInspirationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inKind, Supporters.inspiration)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.2021.supportersExplorationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inKind, Supporters.exploration)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.2021.supportersPlayTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inKind, Supporters.play)}
                                </div>
                                <span className="legend">
                                    <span className="in-kind" />
                                    indicates in-kind support
                                </span>
                            </div>
                        </div>
                    </div>
                    <div
                        className="leadership-section"
                        ref={this.setRef(SECTIONS.team)}
                    >
                        <div className="inner">
                            <h2>
                                <FormattedMessage id="annualReport.2021.leadershipTitle" />
                            </h2>
                            <h3>
                                <FormattedMessage id="annualReport.2021.leadershipBoard" />
                            </h3>
                            <FlexRow className="leadership-board">
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipChair" />
                                    </b>
                                    <h4>Mitchel Resnick</h4>
                                    <FormattedMessage id="annualReport.2021.leadershipProfessor" />
                                    <br />MIT Media Lab
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipViceChair" />
                                    </b>
                                    <h4>David Siegel</h4>
                                    <FormattedMessage id="annualReport.2021.leadershipCoFounder" />
                                    <br />Two Sigma
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipBoardMember" />
                                    </b>
                                    <h4>Margaret Honey</h4>
                                    <FormattedMessage id="annualReport.2021.leadershipPresidentCEO" />
                                    <br />New York Hall of Science
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipBoardMember" />
                                    </b>
                                    <h4>Christina Miller</h4>
                                    <FormattedMessage id="annualReport.2021.leadershipFormerPresident" />
                                    <br />Cartoon Network
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipBoardMember" />
                                    </b>
                                    <h4>Avraham Kadar</h4>
                                    <FormattedMessage id="annualReport.2021.leadershipFounderCEO" />
                                    <br />BrainPOP
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipBoardMember" />
                                    </b>
                                    <h4>Ursula Burns</h4>
                                    <FormattedMessage id="annualReport.2021.leadershipFormerChairCEO" />
                                    <br />Xerox Corporation and VEON Ltd.
                                </div>
                            </FlexRow>
                            <h4>
                                <FormattedMessage id="annualReport.2021.leadershipBoardSecretaryTreasurer" />
                            </h4>
                            <FlexRow className="leadership-board">
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipBoardSecretary" />
                                    </b>
                                    <h4>Sheri Vammen</h4>
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.2021.leadershipBoardTreasurer" />
                                    </b>
                                    <h4>Rich Sauer</h4>
                                </div>
                            </FlexRow>
                            <div className="leadership-scratch-team">
                                <h3>
                                    <FormattedMessage id="annualReport.2021.leadershipScratchTeam" />
                                </h3>
                                <div className="executive-director">
                                    <PeopleGrid
                                        linkToNewTab
                                        people={[{
                                            userName: 'Onyx45',
                                            userId: 63526043,
                                            name: 'Shawna'
                                        }]}
                                    />
                                    <FormattedMessage id="annualReport.2021.leadershipED" />
                                </div>
                                <PeopleGrid
                                    linkToNewTab
                                    people={People}
                                />
                                <p className="thank-you">
                                    <FormattedMessage id="annualReport.2021.teamThankYou" />
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        className="donate-section"
                        ref={this.setRef(SECTIONS.donate)}
                    >
                        <FlexRow className="donate-info">
                            <MediaQuery minWidth={frameless.tabletPortrait}>
                                <img
                                    src="/images/annual-report/donate-illustration.svg"
                                    alt={this.props.intl.formatMessage(
                                        {id: 'annualReport.2021.altDonateIllustration'}
                                    )}
                                />
                            </MediaQuery>
                            <div className="donate-content">
                                <h2>
                                    <FormattedMessage id="annualReport.2021.donateTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.2021.donateMessage" />
                                </p>
                                <a
                                    href="https://secure.donationpay.org/scratchfoundation/"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    <Button className="donate-button">
                                        <FormattedMessage id="annualReport.2021.donateButton" />
                                    </Button>
                                </a>
                            </div>
                        </FlexRow>
                    </div>
                </div>
            </div>
        );
    }
}

AnnualReport.propTypes = {
    intl: intlShape
};

const WrappedAnnualReport = injectIntl(AnnualReport);

render(
    <Page><WrappedAnnualReport /></Page>, document.getElementById('app')
);
