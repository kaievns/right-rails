/**
 * The calendar widget implemented with RightJS
 *
 * Home page: http://rightjs.org/ui/calendar
 *
 * @copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
if (!RightJS) { throw "Gimme RightJS. Please." };
/**
 * The calendar widget for RightJS
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
var Calendar = new Class(Observer, {
  extend: {
    EVENTS: $w('show hide select done'),
    
    Options: {
      format:         'ISO',  // a key out of the predefined formats or a format string
      showTime:       null,   // null for automatic, or true|false to enforce
      showButtons:    false,
      minDate:        null,
      maxDate:        null,
      firstDay:       1,      // 1 for Monday, 0 for Sunday
      fxName:         'fade', // set to null if you don't wanna any fx
      fxDuration:     200,
      numberOfMonths: 1,      // a number or [x, y] greed definition
      timePeriod:     1,      // the timepicker minimal periods (in minutes, might be bigger than 60)
      
      twentyFourHour: null,   // null for automatic, or true|false to enforce
      listYears:      false,  // show/hide the years listing buttons
      
      hideOnPick:     false,  // hides the popup when the user changes a day
      
      cssRule:        '[rel^=calendar]' // css rule for calendar related elements
    },
    
    Formats: {
      ISO:            '%Y-%m-%d',
      POSIX:          '%Y/%m/%d',
      EUR:            '%d-%m-%Y',
      US:             '%m/%d/%Y'
    },
    
    i18n: {
      Done:           'Done',
      Now:            'Now',
      Next:           'Next Month',
      Prev:           'Previous Month',
      NextYear:       'Next Year',
      PrevYear:       'Previous Year',
      
      dayNames:        $w('Sunday Monday Tuesday Wednesday Thursday Friday Saturday'),
      dayNamesShort:   $w('Sun Mon Tue Wed Thu Fri Sat'),
      dayNamesMin:     $w('Su Mo Tu We Th Fr Sa'),
      monthNames:      $w('January February March April May June July August September October November December'),
      monthNamesShort: $w('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec')
    },
    
    current: null, // marker to the currently visible calendar
    instances: {}, // list of registered instances
    
    // finds and/or instanciates a Calendar related to the event target
    find: function(event) {
      var element = event.target;
      
      if (isElement(element) && element.match(Calendar.Options.cssRule)) {
        var uid      = $uid(element);
        return Calendar.instances[uid] = Calendar.instances[uid] ||
          new Calendar(eval('('+element.get('data-calendar-options')+')'));
      }
    },
    
    // DEPRECATED scans for the auto-discoverable calendar inputs
    rescan: function(scope) { }
  },
  
  /**
   * Basic constructor
   *
   * @param Object options
   */
  initialize: function(options) {
    this.$super(options);
    
    this.element = $E('div', {'class': 'right-calendar', calendar: this});
    this.build().connectEvents().setDate(new Date());
  },
  
  /**
   * additional options processing
   *
   * @param Object options
   * @return Calendar this
   */
  setOptions: function(user_options) {
    this.$super(user_options);
    
    var klass   = this.constructor;
    var options = this.options;
    
    with (this.options) {
      // merging the i18n tables
      options.i18n = {};

      for (var key in klass.i18n) {
        i18n[key] = isArray(klass.i18n[key]) ? klass.i18n[key].clone() : klass.i18n[key];
      }
      $ext(i18n, (user_options || {}).i18n);
      
      // defining the current days sequence
      options.dayNames = i18n.dayNamesMin;
      if (firstDay) {
        dayNames.push(dayNames.shift());
      }
      
      // the monthes table cleaning up
      if (!isArray(numberOfMonths)) {
        numberOfMonths = [numberOfMonths, 1];
      }
      
      // min/max dates preprocessing
      if (minDate) minDate = this.parse(minDate);
      if (maxDate) {
        maxDate = this.parse(maxDate);
        maxDate.setDate(maxDate.getDate() + 1);
      }
      
      // format catching up
      format = (klass.Formats[format] || format).trim();
      
      // setting up the showTime option
      if (showTime === null) {
        showTime = format.search(/%[HkIl]/) > -1;
      }
      
      // setting up the 24-hours format
      if (twentyFourHour === null) {
        twentyFourHour = format.search(/%[Il]/) < 0;
      }
      
      // enforcing the 24 hours format if the time threshold is some weird number
      if (timePeriod > 60 && 12 % (timePeriod/60).ceil()) {
        twentyFourHour = true;
      }
    }

    return this;
  },
  
  /**
   * Sets the date on the calendar
   *
   * @param Date date or String date
   * @return Calendar this
   */
  setDate: function(date) {
    this.date = this.prevDate = this.parse(date);
    return this.update();
  },
  
  /**
   * Returns the current date on the calendar
   *
   * @return Date currently selected date on the calendar
   */
  getDate: function() {
    return this.date;
  },
  
  /**
   * Hides the calendar
   *
   * @return Calendar this
   */
  hide: function() {
    this.element.hide(this.options.fxName, {duration: this.options.fxDuration});
    Calendar.current = null;
    return this;
  },
  
  /**
   * Shows the calendar
   *
   * @param Object {x,y} optional position
   * @return Calendar this
   */
  show: function(position) {
    this.element.show(this.options.fxName, {duration: this.options.fxDuration});
    return Calendar.current = this;
  },
  
  /**
   * Inserts the calendar into the element making it inlined
   *
   * @param Element element or String element id
   * @param String optional position top/bottom/before/after/instead, 'bottom' is default
   * @return Calendar this
   */
  insertTo: function(element, position) {
    this.element.addClass('right-calendar-inline').insertTo(element, position);
    return this;
  },
  
  /**
   * Checks if the calendar is inlined
   *
   * @return boolean check
   */
  inlined: function() {
    return this.element.hasClass('right-calendar-inline');
  }
});

/**
 * This module handles the calendar elemnts building/updating processes
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Calendar.include({
  
// protected
  
  // updates the calendar view
  update: function(date) {
    var date = new Date(date || this.date), options = this.options;
    
    var monthes     = this.element.select('div.right-calendar-month');
    var monthes_num = monthes.length;
    
    for (var i=-(monthes_num - monthes_num/2).ceil()+1; i < (monthes_num - monthes_num/2).floor()+1; i++) {
      var month_date    = new Date(date);
      month_date.setMonth(date.getMonth() + i);
      
      this.updateMonth(monthes.shift(), month_date);
    }
    
    this.updateNextPrevMonthButtons(date, monthes_num);
    
    if (options.showTime) {
      this.hours.value = options.timePeriod < 60 ? date.getHours() :
        (date.getHours()/(options.timePeriod/60)).round() * (options.timePeriod/60);
      
      this.minutes.value = (date.getMinutes() / (options.timePeriod % 60)).round() * options.timePeriod;
    }
    
    return this;
  },
  
  // updates a single month-block with the given date
  updateMonth: function(element, date) {
    // getting the number of days in the month
    date.setDate(32);
    var days_number = 32 - date.getDate();
    date.setMonth(date.getMonth()-1);
    
    var cur_day = (this.date.getTime() / 86400000).ceil();
    
    // collecting the elements to update
    var rows  = element.select('tbody tr');
    var cells = rows.shift().select('td');
    element.select('tbody td').each(function(td) {
      td.innerHTML = '';
      td.className = 'right-calendar-day-blank';
    });
    
    var options = this.options;
    
    for (var i=1; i <= days_number; i++) {
      date.setDate(i);
      var day_num = date.getDay();
      
      if (this.options.firstDay) {
        day_num = day_num ? day_num-1 : 6;
      }
      
      cells[day_num].innerHTML = ''+i;
      cells[day_num].className = cur_day == (date.getTime() / 86400000).ceil() ? 'right-calendar-day-selected' : '';
      
      if ((options.minDate && options.minDate > date) || (options.maxDate && options.maxDate < date))
        cells[day_num].className = 'right-calendar-day-disabled';
        
      cells[day_num].date = new Date(date);
      
      if (day_num == 6) {
        cells = rows.shift().select('td');
      }
    }
    
    var caption = (options.listYears ? options.i18n.monthNamesShort[date.getMonth()] + ',' :
      options.i18n.monthNames[date.getMonth()])+' '+date.getFullYear();
    
    element.first('div.right-calendar-month-caption').update(caption);
  },
  
  updateNextPrevMonthButtons: function(date, monthes_num) {
    var options = this.options;
    
    if (options.minDate) {
      var beginning = new Date(date.getFullYear(),0,1,0,0,0);
      var min_date = new Date(options.minDate.getFullYear(),0,1,0,0,0);
      
      this.hasPrevYear = beginning > min_date;
      
      beginning.setMonth(date.getMonth() - (monthes_num - monthes_num/2).ceil());
      min_date.setMonth(options.minDate.getMonth());
      
      this.hasPrevMonth = beginning >= min_date;
    } else {
      this.hasPrevMonth = this.hasPrevYear = true;
    }
    
    if (options.maxDate) {
      var end = new Date(date);
      var max_date = new Date(options.maxDate);
      [end, max_date].each(function(date) {
        date.setDate(32);
        date.setMonth(date.getMonth() - 1);
        date.setDate(32 - date.getDate());
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
      });
      
      this.hasNextMonth = end < max_date;
      
      // checking the next year
      [end, max_date].each('setMonth', 0);
      this.hasNextYear = end < max_date;
    } else {
      this.hasNextMonth = this.hasNextYear = true;
    }
    
    this.nextButton[this.hasNextMonth ? 'removeClass':'addClass']('right-ui-button-disabled');
    this.prevButton[this.hasPrevMonth ? 'removeClass':'addClass']('right-ui-button-disabled');
    
    if (this.nextYearButton) {
      this.nextYearButton[this.hasNextYear ? 'removeClass':'addClass']('right-ui-button-disabled');
      this.prevYearButton[this.hasPrevYear ? 'removeClass':'addClass']('right-ui-button-disabled');
    }
  },

  // builds the calendar
  build: function() {
    this.buildSwaps();
    
    // building the calendars greed
    var greed = tbody = $E('table', {'class': 'right-calendar-greed'}).insertTo(this.element);
    var options = this.options;
    if (Browser.OLD) tbody = $E('tbody').insertTo(greed);
    
    for (var y=0; y < options.numberOfMonths[1]; y++) {
      var row   = $E('tr').insertTo(tbody);
      for (var x=0; x < options.numberOfMonths[0]; x++) {
        $E('td').insertTo(row).insert(this.buildMonth());
      }
    }
    
    if (options.showTime) this.buildTime();
    this.buildButtons();
    
    return this;
  },
  
  // builds the monthes swapping buttons
  buildSwaps: function() {
    var i18n = this.options.i18n;
    
    this.prevButton = $E('div', {'class': 'right-ui-button right-calendar-prev-button',
        html: '&lsaquo;', title: i18n.Prev}).insertTo(this.element);
    this.nextButton = $E('div', {'class': 'right-ui-button right-calendar-next-button',
        html: '&rsaquo;', title: i18n.Next}).insertTo(this.element);
        
    if (this.options.listYears) {
      this.prevYearButton = $E('div', {'class': 'right-ui-button right-calendar-prev-year-button',
        html: '&laquo;', title: i18n.PrevYear}).insertTo(this.prevButton, 'after');
      this.nextYearButton = $E('div', {'class': 'right-ui-button right-calendar-next-year-button',
        html: '&raquo;', title: i18n.NextYear}).insertTo(this.nextButton, 'before');
    }
  },
  
  // builds a month block
  buildMonth: function() {
    return $E('div', {'class': 'right-calendar-month'}).insert(
      '<div class="right-calendar-month-caption"></div>'+
      '<table><thead><tr>'+
        this.options.dayNames.map(function(name) {return '<th>'+name+'</th>';}).join('')+
      '</tr></thead><tbody>'+
          '123456'.split('').map(function() {return '<tr><td><td><td><td><td><td><td></tr>'}).join('')+
      '</tbody></table>'
    );
  },
  
  // builds the time selection block
  buildTime: function() {
    var options = this.options;
    var time_picker = $E('div', {'class': 'right-calendar-time', html: ':'}).insertTo(this.element);
    
    this.hours = $E('select').insertTo(time_picker, 'top');
    this.minutes = $E('select').insertTo(time_picker);
    
    var minutes_threshold = options.timePeriod < 60 ? options.timePeriod : 60;
    var hours_threshold   = options.timePeriod < 60 ? 1 : (options.timePeriod / 60).ceil();
    
    (60).times(function(i) {
      var caption = (i < 10 ? '0' : '') + i;
      
      if (i < 24 && i % hours_threshold == 0) {
        if (options.twentyFourHour)
          this.hours.insert($E('option', {value: i, html: caption}));
        else if (i < 12) {
          this.hours.insert($E('option', {value: i, html: i == 0 ? 12 : i}));
        }
      }
      
      if (i % minutes_threshold == 0) {
        this.minutes.insert($E('option', {value: i, html: caption}));
      }
    }, this);
    
    // adding the meridian picker if it's a 12 am|pm picker
    if (!options.twentyFourHour) {
      this.meridian = $E('select').insertTo(time_picker);
      
      (options.format.includes(/%P/) ? ['am', 'pm'] : ['AM', 'PM']).each(function(value) {
        this.meridian.insert($E('option', {value: value.toLowerCase(), html: value}));
      }, this);
    }
  },
  
  // builds the bottom buttons block
  buildButtons: function() {
    if (!this.options.showButtons) return;
    
    this.nowButton = $E('div', {'class': 'right-ui-button right-calendar-now-button', html: this.options.i18n.Now});
    this.doneButton = $E('div', {'class': 'right-ui-button right-calendar-done-button', html: this.options.i18n.Done});
    
    $E('div', {'class': 'right-ui-buttons right-calendar-buttons'})
      .insert([this.doneButton, this.nowButton]).insertTo(this.element);
  }

});

/**
 * This module handles the events connection
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */ 
Calendar.include({
  /**
   * Initiates the 'select' event on the object
   *
   * @param Date date
   * @return Calendar this
   */
  select: function(date) {
    this.fire('select', this.date = date);
    
    if (this.options.hideOnPick)
      this.done();
    
    return this;
  },
  
  /**
   * Covers the 'done' event fire
   *
   * @return Calendar this
   */
  done: function() {
    if (!this.inlined())
      this.hide();
    return this.fire('done', this.date);
  },
  
  nextDay: function() {
    return this.changeDate({'Date': 1});
  },
  
  prevDay: function() {
    return this.changeDate({'Date': -1});
  },
  
  nextWeek: function() {
    return this.changeDate({'Date': 7});
  },
  
  prevWeek: function() {
    return this.changeDate({'Date': -7});
  },
  
  nextMonth: function() {
    return this.changeDate({Month: 1});
  },
  
  prevMonth: function() {
    return this.changeDate({Month: -1});
  },
  
  nextYear: function() {
    return this.changeDate({FullYear: 1});
  },
  
  prevYear: function() {
    return this.changeDate({FullYear: -1});
  },
  
// protected

  // changes the current date according to the hash
  changeDate: function(hash) {
    var date = new Date(this.date), options = this.options;
    
    for (var key in hash) {
      date['set'+key](date['get'+key]() + hash[key]);
    }
    
    // checking the date range constrains
    if (options.minDate && options.minDate > date) date = new Date(options.minDate);
    if (options.maxDate && options.maxDate < date) {
      date = new Date(options.maxDate);
      date.setDate(date.getDate() - 1);
    }
    return this.update(this.date = date);
  },
  
  connectEvents: function() {
    // connecting the monthes swapping
    this.prevButton.onClick(this.prevMonth.bind(this));
    this.nextButton.onClick(this.nextMonth.bind(this));
    if (this.nextYearButton) {
      this.prevYearButton.onClick(this.prevYear.bind(this));
      this.nextYearButton.onClick(this.nextYear.bind(this));
    }
    
    // connecting the calendar day-cells
    this.element.select('div.right-calendar-month table tbody td').each(function(cell) {
      cell.onClick(function() {
        if (cell.innerHTML != '' && !cell.hasClass('right-calendar-day-disabled')) {
          var prev = this.element.first('.right-calendar-day-selected');
          if (prev) prev.removeClass('right-calendar-day-selected');
          cell.addClass('right-calendar-day-selected');
          this.setTime(cell.date);
        }
      }.bind(this));
    }, this);
    
    // connecting the time picker events
    if (this.hours) {
      this.hours.onChange(this.setTime.bind(this));
      this.minutes.onChange(this.setTime.bind(this));
      if (!this.options.twentyFourHour) {
        this.meridian.onChange(this.setTime.bind(this));
      }
    }
    
    // connecting the bottom buttons
    if (this.nowButton) {
      this.nowButton.onClick(this.setDate.bind(this, new Date()));
      this.doneButton.onClick(this.done.bind(this));
    }
    
    // blocking all the events from the element
    this.element.onMousedown(function(e) { e.stopPropagation(); })
      .onClick(function(event) {
        event.stop();
        if (this.timer) {
          this.timer.cancel();
          this.timer = null;
        }
      }.bind(this));
    
    return this;
  },
  
  // sets the date without nucking the time
  setTime: function(date) {
    // from clicking a day in a month table
    if (date instanceof Date) {
      this.date.setYear(date.getFullYear());
      this.date.setMonth(date.getMonth());
      this.date.setDate(date.getDate());
    }
    
    if (this.hours) {
      this.date.setHours(this.hours.value.toInt() + (!this.options.twentyFourHour && this.meridian.value == 'pm' ? 12 : 0));
      this.date.setMinutes(this.minutes.value);
    }

    return this.select(this.date);
  }
  
});

/**
 * This module handles the calendar assignment to an input field
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Calendar.include({
  /**
   * Assigns the calendar to serve the given input element
   *
   * If no trigger element specified, then the calendar will
   * appear and disappear with the element haveing its focus
   *
   * If a trigger element is specified, then the calendar will
   * appear/disappear only by clicking on the trigger element
   *
   * @param Element input field
   * @param Element optional trigger
   * @return Calendar this
   */
  assignTo: function(input, trigger) {
    var input = $(input), trigger = $(trigger);
    
    if (trigger) {
      trigger.onClick(function(e) {
        e.stop();
        this.showAt(input.focus());
      }.bind(this));
    } else {
      input.on({
        focus: this.showAt.bind(this, input),
        
        click: function(e) {
          e.stop();
          if (this.element.hidden())
            this.showAt(input);
        }.bind(this),
        
        keyDown: function(e) {
          if (e.keyCode == 9 && this.element.visible())
            this.hide();
        }.bind(this)
      });
    }
    
    return this;
  },
  
  /**
   * Shows the calendar at the given element left-bottom corner
   *
   * @param Element element or String element id
   * @return Calendar this
   */
  showAt: function(element) {
    var element = $(element), dims = element.dimensions();
    this.setDate(this.parse(element.value));
    
    this.element.setStyle({
      position: 'absolute',
      margin: '0',
      left: (dims.left)+'px',
      top: (dims.top + dims.height)+'px'
    }).insertTo(document.body);
    
    this.stopObserving('select').stopObserving('done');
    this.on(this.doneButton ? 'done' : 'select', function() {
      element.value = this.format();
    }.bind(this));
    
    return this.hideOthers().show();
  },
  
  /**
   * Toggles the calendar state at the associated element position
   *
   * @param Element input
   * @return Calendar this
   */
  toggleAt: function(input) {
    if (this.element.parentNode && this.element.visible()) {
      this.hide();
    } else {
      this.showAt(input);
    }
    return this;
  },
  
// protected

  // hides all the other calendars on the page
  hideOthers: function() {
    $$('div.right-calendar').each(function(element) {
      if (!element.hasClass('right-calendar-inline')) {
        if (element != this.element) {
          element.hide();
        }
      }
    });
    
    return this;
  }
});

/**
 * This module handles the dates parsing/formatting processes
 *
 * To format dates and times this scripts use the GNU (C/Python/Ruby) strftime
 * function formatting principles
 *
 *   %a - The abbreviated weekday name (``Sun'')
 *   %A - The  full  weekday  name (``Sunday'')
 *   %b - The abbreviated month name (``Jan'')
 *   %B - The  full  month  name (``January'')
 *   %d - Day of the month (01..31)
 *   %e - Day of the month without leading zero (1..31)
 *   %m - Month of the year (01..12)
 *   %y - Year without a century (00..99)
 *   %Y - Year with century
 *   %H - Hour of the day, 24-hour clock (00..23)
 *   %k - Hour of the day, 24-hour clock without leading zero (0..23)
 *   %I - Hour of the day, 12-hour clock (01..12)
 *   %l - Hour of the day, 12-hour clock without leading zer (0..12)
 *   %p - Meridian indicator (``AM''  or  ``PM'')
 *   %P - Meridian indicator (``pm''  or  ``pm'')
 *   %M - Minute of the hour (00..59)
 *   %S - Second of the minute (00..60)
 *   %% - Literal ``%'' character
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Calendar.include({

  /**
   * Parses out the given string based on the current date formatting
   *
   * @param String string date
   * @return Date parsed date or null if it wasn't parsed
   */
  parse: function(string) {
    var date;
    
    if (isString(string) && string) {
      var tpl = RegExp.escape(this.options.format);
      var holders = tpl.match(/%[a-z]/ig).map('match', /[a-z]$/i).map('first').without('%');
      var re  = new RegExp('^'+tpl.replace(/%p/i, '(pm|PM|am|AM)').replace(/(%[a-z])/ig, '(.+?)')+'$');
      
      var match = string.trim().match(re);
      
      if (match) {
        match.shift();
        
        var year = null, month = null, date = null, hour = null, minute = null, second = null, meridian;
        
        while (match.length) {
          var value = match.shift();
          var key   = holders.shift();
          
          if (key.toLowerCase() == 'b') {
            month = this.options.i18n[key=='b' ? 'monthNamesShort' : 'monthNames'].indexOf(value);
          } else if (key.toLowerCase() == 'p') {
            meridian = value.toLowerCase();
          } else {
            value = value.toInt();
            switch(key) {
              case 'd': 
              case 'e': date   = value; break;
              case 'm': month  = value-1; break;
              case 'y': 
              case 'Y': year   = value; break;
              case 'H': 
              case 'k': 
              case 'I': 
              case 'l': hour   = value; break;
              case 'M': minute = value; break;
              case 'S': second = value; break;
            }
          }
        }
        
        // converting 1..12am|pm into 0..23 hours marker
        if (meridian) {
          hour = hour == 12 ? 0 : hour;
          hour = (meridian == 'pm' ? hour + 12 : hour);
        }
        
        date = new Date(year, month, date, hour, minute, second);
      }
    } else if (string instanceof Date || Date.parse(string)) {
      date = new Date(string);
    }
    
    return (!date || isNaN(date.getTime())) ? new Date : date;
  },  
  
  /**
   * Formats the current date into a string depend on the current or given format
   *
   * @param String optional format
   * @return String formatted data
   */
  format: function(format) {
    var i18n   = this.options.i18n;
    var day    = this.date.getDay();
    var month  = this.date.getMonth();
    var date   = this.date.getDate();
    var year   = this.date.getFullYear();
    var hour   = this.date.getHours();
    var minute = this.date.getMinutes();
    var second = this.date.getSeconds();
    
    var hour_ampm = (hour == 0 ? 12 : hour < 13 ? hour : hour - 12);
    
    var values    = {
      a: i18n.dayNamesShort[day],
      A: i18n.dayNames[day],
      b: i18n.monthNamesShort[month],
      B: i18n.monthNames[month],
      d: (date < 10 ? '0' : '') + date,
      e: ''+date,
      m: (month < 9 ? '0' : '') + (month+1),
      y: (''+year).substring(2,4),
      Y: ''+year,
      H: (hour < 10 ? '0' : '')+ hour,
      k: '' + hour,
      I: (hour > 0 && (hour < 10 || (hour > 12 && hour < 22)) ? '0' : '') + hour_ampm,
      l: '' + hour_ampm,
      p: hour < 12 ? 'AM' : 'PM',
      P: hour < 12 ? 'am' : 'pm',
      M: (minute < 10 ? '0':'')+minute,
      S: (second < 10 ? '0':'')+second,
      '%': '%'
    };
    
    var result = format || this.options.format;
    for (var key in values) {
      result = result.replace('%'+key, values[key]);
    }
    
    return result;
  }
});

/**
 * Calendar fields autodiscovery via the rel="calendar" attribute
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */


(function() {
  // shows a calendar by an event
  var show_calendar = function(event) {
    var calendar = Calendar.find(Event.ext(event));
    
    if (calendar && Calendar.current != calendar) {
      var input     = event.target;
      var rule      = Calendar.Options.cssRule.split('[').last();
      var key       = rule.split('=').last().split(']').first();
      var rel_id_re = new RegExp(key+'\\[(.+?)\\]');
      var rel_id    = input.get(rule.split('^=')[0]);
      
      if (rel_id && (rel_id = rel_id.match(rel_id_re))) {
        input = $(rel_id[1]);
        event.stop();
      }
      
      calendar.showAt(input);
    }
  };
  
  // on-click handler
  var on_mousedown = function(event) {
    show_calendar(event);
  };
  
  var on_click = function(event) {
    var target = event.target;
    if (Calendar.find(event)) {
      if (target.tagName == 'A')
        event.stop();
    } else if (Calendar.current) {
      if (![target].concat(target.parents()).first('hasClass', 'right-calendar')) {
        Calendar.current.hide();
      }
    }
  };
  
  // on-focus handler
  var on_focus = function(event) {
    show_calendar(event);
  };
  
  // on-blur handler
  var on_blur = function(event) {
    var calendar = Calendar.find(Event.ext(event));
    
    if (calendar) {
      // We delay hiding of the calendar block to give calendar's onclick handler
      // a chance to cancel hiding by killing the timer, as a workaround for IE issues
      calendar.timer = (
        function() { this.hide(); }.bind(calendar)
      ).delay(200);
    }
  };
  
  var on_keydown = function(event) {
    if (Calendar.current) {
      var name;

      switch(event.keyCode) {
        case 27: name = 'hide';      break;
        case 37: name = 'prevDay';   break;
        case 39: name = 'nextDay';   break;
        case 38: name = 'prevWeek';  break;
        case 40: name = 'nextWeek';  break;
        case 34: name = 'nextMonth'; break;
        case 33: name = 'prevMonth'; break;
        case 13:
           Calendar.current.select(Calendar.current.date);
           name = 'done';
           break;
      }

      if (name) {
        Calendar.current[name]();
        event.stop();
      }
    }
  };
  
  
  document.on({
    mousedown: on_mousedown,
    click:     on_click,
    keydown:   on_keydown
  });
  
  // the focus and blur events need some extra care
  if (Browser.IE) {
    // IE version
    document.attachEvent('onfocusin', on_focus);
    document.attachEvent('onfocusout', on_blur);
  } else {
    // W3C version
    document.addEventListener('focus', on_focus, true);
    document.addEventListener('blur',  on_blur,  true);
  }
})();


document.write("<style type=\"text/css\">div.right-calendar,div.right-calendar table,div.right-calendar table tr,div.right-calendar table th,div.right-calendar table td,div.right-calendar table tbody,div.right-calendar table thead{background:none;border:none;width:auto;height:auto;margin:0;padding:0}*.right-ui-button{display:inline-block;*display:inline;*zoom:1;height:1em;line-height:1em;padding:.2em .5em;text-align:center;border:1px solid #CCC;border-radius:.2em;-moz-border-radius:.2em;-webkit-border-radius:.2em;cursor:pointer;color:#555;background-color:#FFF}*.right-ui-button:hover{color:#222;border-color:#999;background-color:#CCC}*.right-ui-button-disabled,*.right-ui-button-disabled:hover{color:#888;background:#EEE;border-color:#CCC;cursor:default}*.right-ui-buttons{margin-top:.5em}div.right-calendar{position:absolute;height:auto;border:1px solid #BBB;position:relative;padding:.5em;border-radius:.3em;-moz-border-radius:.3em;-webkit-border-radius:.3em;cursor:default;background-color:#EEE;-moz-box-shadow:.2em .4em .8em #666;-webkit-box-shadow:.2em .4em .8em #666}div.right-calendar-inline{position:relative;display:inline-block;vertical-align:top;*display:inline;*zoom:1;-moz-box-shadow:none;-webkit-box-shadow:none}div.right-calendar-prev-button,div.right-calendar-next-button,div.right-calendar-prev-year-button,div.right-calendar-next-year-button{position:absolute;float:left;width:1em;padding:.15em .4em}div.right-calendar-next-button{right:.5em}div.right-calendar-prev-year-button{left:2.55em}div.right-calendar-next-year-button{right:2.55em}div.right-calendar-month-caption{text-align:center;height:1.2em;line-height:1.2em}table.right-calendar-greed{border-spacing:0px}table.right-calendar-greed td{vertical-align:top;padding-right:.4em}table.right-calendar-greed>tbody>td:last-child{padding:0}div.right-calendar-month table{margin-top:.2em;border-spacing:1px;border-collapse:separate}div.right-calendar-month table th{color:#777;text-align:center}div.right-calendar-month table td{text-align:right;padding:.1em .3em;background-color:#FFF;border:1px solid #CCC;cursor:pointer;color:#555;border-radius:.2em;-moz-border-radius:.2em;-webkit-border-radius:.2em}div.right-calendar-month table td:hover{background-color:#CCC;border-color:#AAA;color:#000}div.right-calendar-month table td.right-calendar-day-blank{background:transparent;cursor:default;border:none}div.right-calendar-month table td.right-calendar-day-selected{background-color:#BBB;border-color:#AAA;color:#222;font-weight:bold;padding:.1em .2em}div.right-calendar-month table td.right-calendar-day-disabled{color:#888;background:#EEE;border-color:#CCC;cursor:default}div.right-calendar-time{border-top:1px solid #ccc;margin-top:.3em;padding-top:.5em;text-align:center}div.right-calendar-time select{margin:0 .4em}div.right-calendar-buttons div.right-ui-button{width:3.2em}div.right-calendar-done-button{position:absolute;right:.5em}</style>");