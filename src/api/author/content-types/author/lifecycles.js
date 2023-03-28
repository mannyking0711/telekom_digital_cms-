/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	INCLUDES
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

"use strict";

const helper = require("../../../helper");

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	AUTHOR MODEL
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

const createFullname = (item) => {
  if ( !item.name ) return
  // create fullname
  if (item.surname) {
    item.fullname = item.name.trim() + " " + item.surname.trim();
  } else {
    item.fullname = item.name.trim();
  }
};

module.exports = {
  /////////////////////////////////
  // HOOKS
  /////////////////////////////////

  async beforeCreate(event) {
    createFullname(event.params.data);

    // TODO_NOTE : Author have just slug
    // const locale = event.params.data.locale;
    // helper.createSlugs(event.params.data, locale, 'fullname');
  },

  async beforeUpdate(event) {
    createFullname(event.params.data);
    // const id = event.params.where.id;
    // const uid = event.model.uid
    // const locale = await helper.getBeforeUpdateLocale(id, uid);
    // helper.createSlugs(event.params.data, locale, 'fullname');
  },

  /*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
};
