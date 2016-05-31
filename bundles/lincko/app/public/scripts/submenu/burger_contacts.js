submenu_list['burger_contacts'] = {
	"_title": {
        "style": "customized_title",
        "title": "Start New Chat",
        "class": function(elem) {
                return 'submenu_wrapper_taskdetail_tasks';
        },
    },
    "left_button": {
        "style": "title_left_button",
        "title": 'Cancel',//toto
        'hide': true,
        "class": "base_pointer",
    },
    "right_button": {
        "style": "title_right_button",
        "title": "Select", //toto
        "class": "base_pointer",
        "action": function(elem, submenuInst) {
            var userList = {};
            var nameList = "";
            var IDList = _submenu_get_contacts(elem);
            console.log(IDList);
            burger_contacts_sendAction(submenuInst.param.contactsID, IDList, submenuInst.param.item_obj);
        },
        hide: true,
    },


    'contacts': {
        "style": "contacts",
        "title": "contacts",
    }
};