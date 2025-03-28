// Ultra compact calendar styles
const CALENDAR_WIDTH = 230; // Narrow enough to fit days

const compactCalendarStyles = {
    // Root paper container
    '& .MuiPaper-root': {
        backgroundColor: '#1a1a1a',
        color: 'white',
        border: '1px solid rgba(255, 184, 0, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        width: `${CALENDAR_WIDTH}px !important`,
        maxWidth: `${CALENDAR_WIDTH}px !important`,
        minWidth: `${CALENDAR_WIDTH}px !important`,
    },

    // Calendar component
    '& .MuiDateCalendar-root': {
        width: `${CALENDAR_WIDTH}px !important`,
        maxWidth: `${CALENDAR_WIDTH}px !important`,
        minWidth: `${CALENDAR_WIDTH}px !important`,
        padding: '0px',
        margin: '0px',
    },

    // Day calendar
    '& .MuiDayCalendar-root': {
        width: `${CALENDAR_WIDTH}px !important`,
        maxWidth: `${CALENDAR_WIDTH}px !important`,
        minWidth: `${CALENDAR_WIDTH}px !important`,
        padding: '0px',
        margin: '0px',
    },

    // Month header
    '& .MuiPickersCalendarHeader-root': {
        padding: '4px',
        color: 'white',
        height: '36px',
        minHeight: '36px',
        maxHeight: '36px',
    },

    // Month name
    '& .MuiPickersCalendarHeader-labelContainer': {
        fontSize: '1.1rem', // Increased from 0.9rem
        fontWeight: 'bold',
        margin: '0',
        color: 'white',
    },

    // Arrow buttons
    '& .MuiPickersCalendarHeader-switchViewButton, & .MuiPickersArrowSwitcher-button': {
        color: 'white',
        padding: '2px',
        minWidth: '24px',
        width: '24px',
        height: '24px',
    },

    // Icons
    '& .MuiSvgIcon-root': {
        color: 'white',
        fontSize: '1rem',
    },

    // Weekday header
    '& .MuiDayCalendar-header': {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0px',
        padding: '0px',
        height: '20px',
        minHeight: '20px',
    },

    // Weekday labels
    '& .MuiDayCalendar-weekDayLabel': {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.75rem', // Increased from 0.65rem
        width: '20px',
        height: '20px',
        minWidth: '20px',
        maxWidth: '20px',
        padding: '0px',
        margin: '0px',
    },

    // Week containers
    '& .MuiDayCalendar-weekContainer': {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0px',
        padding: '0px',
        height: '20px',
        minHeight: '20px',
    },

    // Day cells
    '& .MuiPickersDay-root': {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: '0.8rem', // Increased from 0.7rem
        width: '20px',
        height: '20px',
        minWidth: '20px',
        minHeight: '20px',
        maxWidth: '20px',
        maxHeight: '20px',
        padding: '0px',
        margin: '0px',
        borderRadius: '50%',
        '&:hover': {
            backgroundColor: 'rgba(255, 184, 0, 0.2)',
        },
        '&.Mui-selected': {
            backgroundColor: '#ffb800',
            color: 'black',
            fontWeight: 'bold',
        },
    },

    // Today's date
    '& .MuiPickersDay-today': {
        border: '1px solid #ffb800',
        color: '#ffb800',
        '&.Mui-selected': {
            backgroundColor: '#ffb800',
            color: 'black',
        },
    },

    // Month container
    '& .MuiDayCalendar-monthContainer': {
        margin: '0px',
        padding: '0px',
    },

    // Hide footer buttons
    '& .MuiDialogActions-root': {
        display: 'none',
    },

    // Other calendar views
    '& .MuiYearCalendar-root, & .MuiMonthCalendar-root': {
        backgroundColor: '#1a1a1a',
        '& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton': {
            color: 'white',
            '&.Mui-selected': {
                backgroundColor: '#ffb800',
                color: 'black',
            },
        },
    },
};

export { compactCalendarStyles, CALENDAR_WIDTH };
