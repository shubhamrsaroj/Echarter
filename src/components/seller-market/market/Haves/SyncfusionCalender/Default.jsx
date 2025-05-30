import '../../../../../index.css';
import * as React from 'react';
import { useState, useRef, useEffect, useContext } from 'react';
import './syncfusion-license';
import { ScheduleComponent, ViewsDirective, ViewDirective, Day, Week, WorkWeek, Month, Agenda, Inject, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { PropertyPane } from './property-pane';
import { SellerMarketContext } from '../../../../../context/seller-market/SellerMarketContext';
import { tokenHandler } from '../../../../../utils/tokenHandler';

const Default = () => {
    const scheduleObj = useRef(null);
    const [scheduleData, setScheduleData] = useState(new Date());
    const { companyHaves, companyHavesLoading, companyHavesError, getAllCompanyHaves, deleteHave, companyId } = useContext(SellerMarketContext);
    const [eventData, setEventData] = useState([]);
    const [deleteDialogProps, setDeleteDialogProps] = useState({
        visible: false,
        message: '',
        eventId: null
    });

    useEffect(() => {
        if (companyId && (!companyHaves || companyHaves.length === 0)) {
            getAllCompanyHaves(companyId);
        }
    }, [companyId, getAllCompanyHaves, companyHaves]);

    const formatDate = (date) => {
        const dateObj = new Date(date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        const hours = dateObj.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        
        return `${day} ${month} ${hour12} ${ampm}`;
    };

    useEffect(() => {
        const transformedData = companyHaves && companyHaves.length > 0
            ? companyHaves.map((have, index) => {
                return {
                    Id: have.id,
                    Subject: `${have.acType} ${have.registration} ${have.availType} ${have.fromCity} - ${have.toCity} ${have.seats} ${have.price}`,
                    StartTime: new Date(have.dateFrom),
                    EndTime: new Date(have.dateTo),
                    IsAllDay: true,
                    CategoryColor: getRandomColor(index),
                    Description: `Aircraft Category: ${have.acCat}, Created By: ${have.createdBy}`
                };
            })
            : [];
        setEventData(transformedData);
    }, [companyHaves]);

    const getRandomColor = (index) => {
        const colors = ['#1aaa55', '#357cd2', '#7fa900', '#ea7a57', '#00bdae', '#f57f17'];
        return colors[index % colors.length];
    };
    
    const change = (args) => {
        setScheduleData(args.value);
        scheduleObj.current.dataBind();
    };
    
    const onDragStart = (args) => {
        args.navigation.enable = true;
    };

    const handleDeleteHave = async (haveId) => {
        try {
            await deleteHave(haveId);
        } catch (error) {
            console.error('Failed to delete availability:', error);
            alert('Failed to delete availability. Please try again.');
        }
    };
    
    const handleDeleteDialog = (show, message = '', eventId = null) => {
        setDeleteDialogProps({
            visible: show,
            message,
            eventId
        });
    };

    const onActionBegin = (args) => {
        if (args.requestType === 'eventRemove' && args.data && args.data.length > 0) {
            args.cancel = true;
            const event = args.data[0];
            const haveId = event.Id;
            
            // Get current user ID from token
            const currentUser = tokenHandler.parseUserFromToken(tokenHandler.getToken());
            const currentUserId = currentUser?.id;
            
            // Extract createdBy from Description
            const createdBy = event.Description.split('Created By: ')[1];
            
            // Show different confirmation message based on creator
            const message = createdBy !== currentUserId
                ? "Looks like this is not created by you. Click to delete anyway?"
                : "Are you sure you want to delete this event?";
            
            handleDeleteDialog(true, message, haveId);
        }
    };

    const handleDeleteConfirm = () => {
        if (deleteDialogProps.eventId) {
            handleDeleteHave(deleteDialogProps.eventId);
        }
        handleDeleteDialog(false);
    };

    const dialogButtons = [
        {
            buttonModel: {
                content: 'Delete',
                isPrimary: true,
                cssClass: 'e-btn e-primary'
            },
            click: handleDeleteConfirm
        },
        {
            buttonModel: {
                content: 'Cancel',
                cssClass: 'e-btn'
            },
            click: () => handleDeleteDialog(false)
        }
    ];

    const eventTemplate = (props) => {
        const startDate = formatDate(props.StartTime);
        const endDate = formatDate(props.EndTime);
        return (
            <div className="template-wrap">
                <div className="subject text-sm">{props.Subject}</div>
                <div className="time text-sm mt-1">{startDate} - {endDate}</div>
            </div>
        );
    };
    
    if (companyHavesLoading) {
        return <div>Loading aircraft availability data...</div>;
    }

    if (companyHavesError && companyHavesError !== 'No data found') {
        return <div>Error loading aircraft availability: {companyHavesError}</div>;
    }
    
    return (
        <div className='schedule-control-section'>
            <div className='col-lg-9 control-section'>
                <div className='control-wrapper'>
                    {companyHavesError === 'No data found' && (
                        <div className="mb-4 p-2 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded">
                            No aircraft availability data found. The calendar is empty.
                        </div>
                    )}
                    <ScheduleComponent 
                        height='650px' 
                        ref={scheduleObj} 
                        selectedDate={scheduleData} 
                        eventSettings={{ 
                            dataSource: eventData,
                            template: eventTemplate
                        }}
                        dragStart={onDragStart}
                        actionBegin={onActionBegin}
                    >
                        <ViewsDirective>
                            <ViewDirective option='Day'/>
                            <ViewDirective option='Week'/>
                            <ViewDirective option='WorkWeek'/>
                            <ViewDirective option='Month'/>
                            <ViewDirective option='Agenda'/>
                        </ViewsDirective>
                        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]}/>
                    </ScheduleComponent>
                    
                    <DialogComponent
                        width="400px"
                        visible={deleteDialogProps.visible}
                        buttons={dialogButtons}
                        showCloseIcon={false}
                        header=""
                        closeOnEscape={true}
                        cssClass="delete-confirmation-dialog"
                        close={() => handleDeleteDialog(false)}
                    >
                        <div className="dialog-content">
                            {deleteDialogProps.message}
                        </div>
                    </DialogComponent>
                </div>
            </div>
            <div className='col-lg-3 property-section'>
                <PropertyPane title='Properties'>
                    <table id='property' title='Properties' className='property-panel-table' style={{ width: '100%' }}>
                        <tbody>
                            <tr style={{ height: '50px' }}>
                                <td style={{ width: '100%' }}>
                                    <div className='datepicker-control-section'>
                                        <DatePickerComponent 
                                            value={scheduleData} 
                                            showClearButton={false} 
                                            change={change} 
                                            placeholder='Current Date' 
                                            floatLabelType='Always'
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </PropertyPane>
            </div>
        </div>
    );
};

export default Default;